//
//  flowlib_private.c
//  flowlib
//
//  Created by Christopher Hook on 27/01/2022.
//

#ifndef _WIN32

#include "flowlib_private.h"
#include <stdio.h>
#include <unistd.h>
#include <sys/sysctl.h>
#include <stdlib.h>
#include <string.h>
#include <regex.h>

#include "flowlib_private_mac.h"

#define DDC_TX_LENGTH_FOR_TX 7
#define DDC_TX_LENGTH_FOR_RX 5
#define DDC_RX_LENGTH 11
#define TX_REGISTER 0x6E
#define RX_REGISTER 0x6F

bool isDisplayIdActive(uint32_t displayId)
{
    uint32_t displayCount = 0;
    CGDirectDisplayID mainDisplay;
    uint32_t maxDisplays = MAX_DISPLAYS;
    CGDirectDisplayID onlineDisplays[MAX_DISPLAYS] = {0};
    
    mainDisplay = CGMainDisplayID();
    
    CGError dErr = CGGetOnlineDisplayList(maxDisplays, onlineDisplays, &displayCount);
    if (dErr == kCGErrorSuccess)
    {
        for (uint8_t i = 0; i < displayCount; i++)
        {
            if (onlineDisplays[i] == displayId)
            {
                return true;
            }
        }
    }
    return false;
}

uint32_t getDisplayIndex(uint32_t displayId)
{
    uint32_t displayCount = 0;
    uint32_t maxDisplays = MAX_DISPLAYS;
    CGDirectDisplayID onlineDisplays[MAX_DISPLAYS] = {0};
    CGError dErr = CGGetOnlineDisplayList(maxDisplays, onlineDisplays, &displayCount);
    
    uint32_t index = 0;
    
    for (uint32_t i = 0; i < displayCount; i++)
   {
       if(displayId == onlineDisplays[i])
       {
           index = i;
           break;
       }
   }

    return index;
}


bool coreDisplayPropertyValue(char* result, uint32_t resultLen, const char* property, uint32_t displayId)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    void* coreDisplayHandle = dlopen("/System/Library/Frameworks/CoreDisplay.framework/CoreDisplay", RTLD_GLOBAL | RTLD_NOW);
    CFDictionaryRef (*getDictionary)(CGDirectDisplayID) = dlsym(coreDisplayHandle, "CoreDisplay_DisplayCreateInfoDictionary");
    CFDictionaryRef displayInfo = getDictionary(displayId);
    CFStringRef propertyString = CFStringCreateWithCString(kCFAllocatorDefault, property, kCFStringEncodingUTF8);
    const void* propertyValue = CFDictionaryGetValue(displayInfo, propertyString);
    if (propertyValue != NULL)
    {
        CFStringRef value = (CFStringRef)(propertyValue);
        return CFStringGetCString(value, result, resultLen, kCFStringEncodingUTF8);
    }
    return false;
}

bool getExternalDisplayNumberForDisplayId(uint32_t displayId, uint32_t* externalNumber)
{
    const char* property = "CGDisplayCADeviceName";
    char details[128] = {0};
    if (coreDisplayPropertyValue(&details[0], sizeof(details), property, displayId))
    {
        char* pPosition = strchr(details, '-');
        if (pPosition != 0)
        {
            //uint32_t external = 0;
            uint32_t externalIndex = displayId - 2;
            if (sscanf(details, "external-%u", &externalIndex) == 1)
            {
                *externalNumber = externalIndex;
                return true;
            }
        }
    }
    return false;
}

bool getInternalDisplayBrightness(float* brightness)
{
    void* displayServicesLibHandle = dlopen("/System/Library/PrivateFrameworks/DisplayServices.framework/DisplayServices", RTLD_NOW);
    void* functionAddress = dlsym(displayServicesLibHandle, "DisplayServicesGetBrightness");
    int (*DisplayServicesGetBrightness)(int, float*) = (int (*)(int, float*))functionAddress;
    uint32_t mainDisplay = CGMainDisplayID();
    int result = DisplayServicesGetBrightness(mainDisplay, brightness);
    dlclose(displayServicesLibHandle);
    return result == 0;
}

bool getDdcConnectionForDisplay_m1(uint32_t displayId, CFTypeRef* ddcConnection)
{
    uint32_t externalNumber = 0;
    char externalName[128] = {0};
    bool result = false;

    if (!isDisplayIdActive(displayId))
    {
        return false;
    }

    if (getExternalDisplayNumberForDisplayId(displayId, &externalNumber))
    {
        io_iterator_t iterator = 0;
        CFMutableDictionaryRef matching = IOServiceMatching("IOService");
        kern_return_t ioServices = IOServiceGetMatchingServices(kIOMasterPortDefault, matching, &iterator);
        
        while (ioServices == kIOReturnSuccess && IOIteratorIsValid(iterator))
        {
            io_name_t name;
            const io_name_t role = "role";
            io_object_t service = IOIteratorNext(iterator);
            kern_return_t nameResult = IORegistryEntryGetName(service, name);
            
            if (nameResult != kIOReturnSuccess)
            {
                return false;
            }

            CFStringRef deviceName = CFStringCreateWithCString(kCFAllocatorDefault, name, kCFStringEncodingASCII);

            if (CFStringCompare(deviceName, CFSTR("DCPAVServiceProxy"), 0) == kCFCompareEqualTo)
            {
                io_registry_entry_t parent;
                CFRelease(deviceName);
                // this is a ddc connection interface for M1 devices

                kern_return_t getParent = IORegistryEntryGetParentEntry(service, kIOServicePlane, &parent);
                if (getParent != kIOReturnSuccess)
                {
                    return false;
                }
                
                if (!IORegistryEntryInPlane(parent, role))
                {
                    return false;
                }
                
                CFStringRef parentDetails = IORegistryEntryCreateCFProperty(parent, CFSTR("role"), kCFAllocatorDefault, 0);
                
                if (parentDetails)
                {
                    memset(externalName, 0, sizeof(externalName));
                    if (CFStringGetCString(parentDetails, &externalName[0], sizeof(externalName), kCFStringEncodingUTF8))
                    {
                        if (strcmp("DCP", externalName) == 0 && displayId == 1)
                        {
                            return false;
                        }
                        else if (strcmp("DCPEXT", externalName) == 0 && displayId == 2)
                        {
                            // this is an M1 mac air, and we want to access the only external display
                            
                            *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                            result = true;
                            break;
                            
                        }
                        else
                        {
                            // this is usually mac max case

                            uint32_t displayCount = 0;
                             uint32_t displayIds[8] = {0};
                            CGError dErr = CGGetOnlineDisplayList(MAX_DISPLAYS, &displayIds, &displayCount);
                            
                            if(displayCount <= 2) {
                                uint32_t thisDisplayId = 0;
                                if(sscanf(externalName, "DCPEXT%u", &thisDisplayId) == 1)
                               {
                                   *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                                   result = true;
                                   break;
                                }
                                
                            } else {
                                char buf[12];
                                uint32_t newExternalNumber = externalNumber;

                                if(displayIds[1] == displayId){
                                    newExternalNumber = 0;
                                } else if (displayIds[2] == displayId){
                                    newExternalNumber = 1;
                                } else if(displayCount > 3) {
                                    if(externalNumber >= 3){
                                       newExternalNumber = 1;
                                    }
                                }
                                
                                snprintf(buf, 12, "DCPEXT%d", newExternalNumber);
                               
                                if(strcmp(externalName, buf) == 0)
                                {
                                    *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                                    result = true;
                                    break;
                                }
                            }

                            // if (sscanf(externalName, "DCPEXT%u", &externalNumber) == 1){
                            //     *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                            //     result = true;
                            //     break;
                            // }
                            

                            // if(strcmp("DCPEXT0", externalName) == 0 && displayId == 2){
                            //     *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                            //     result = true;
                            //     break;
                            // } else if (strcmp("DCPEXT1", externalName) == 0 && displayId == 3 ) {
                            //     *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                            //     result = true;
                            //     break;
                            // }
                            // uint32_t thisDisplayId = 0;
                            // if (sscanf(externalName, "DCPEXT%u", &thisDisplayId) == 1)
                            // {
                            //     uint32_t displayCount = 0;
                            //     CGError dErr = CGGetOnlineDisplayList(MAX_DISPLAYS, NULL, &displayCount);
                            //     if (displayCount <= 2)
                            //     {
                            //         *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                            //         result = true;
                            //         break;
                            //     }
                            //     else if (externalNumber == (thisDisplayId))
                            //     {
                            //         *ddcConnection = IOAVServiceCreateWithService(kCFAllocatorDefault, service);
                            //         result = true;
                            //         break;
                            //     }
                            // }
                        }
                    }
                }
            }
        }
        IOObjectRelease(iterator);
    }
    return result;
}

bool getVcpCode_m1(uint32_t displayId, uint8_t code, uint32_t* result)
{
    uint8_t transmission[DDC_TX_LENGTH_FOR_RX] = {0x51, 0x82, 0x01, code, 0x00};
    uint8_t reception[DDC_RX_LENGTH] = {0};
    uint8_t checksum = TX_REGISTER;
    usleep(50000);
    for (uint8_t i = 2; i < DDC_TX_LENGTH_FOR_RX - 1; i++)
    {
        checksum ^= transmission[i];
    }
    transmission[DDC_TX_LENGTH_FOR_RX - 1] = checksum;
    CFTypeRef service;
    if (getDdcConnectionForDisplay_m1(displayId, &service) && service != NULL)
    {
        IOReturn txResult = IOAVServiceWriteI2C(service, TX_REGISTER >> 1, transmission[0], &transmission[1], DDC_TX_LENGTH_FOR_RX - 1);
        if (txResult != kIOReturnSuccess)
        {
            return false;
        }
        usleep(50000);
        
        IOReturn rxResult = IOAVServiceReadI2C(service, RX_REGISTER >> 1, 0, &reception[0], DDC_RX_LENGTH);
        CFRelease(service);
        
        if (rxResult != kIOReturnSuccess || reception[0] != TX_REGISTER || reception[1] == 0x00 || reception[1] - 0x80 == 0)
        {
            return false;
        }
        
        uint8_t length = reception[1] - 0x80;
        
        if (length != 0x08)
        {
            return false;
        }
        
        checksum = 0x50;
        for (uint8_t i = 0; i < DDC_RX_LENGTH - 1; i ++)
        {
            checksum ^= reception[i];
        }
        
        if (checksum != reception[DDC_RX_LENGTH - 1])
        {
            return false;
        }
        
        *result = reception[9];
        
        return true;
    }
    return false;
}

bool setVcpCode_m1(uint32_t displayId, uint8_t code, uint32_t value)
{
    CFTypeRef service;
    if (getDdcConnectionForDisplay_m1(displayId, &service) && service != NULL)
    {
        uint8_t transmission[DDC_TX_LENGTH_FOR_TX] = {0x51, 0x84, 0x03, code, 0x00, (uint8_t)(value & 0xFF), 0x00};

        uint8_t checksum = TX_REGISTER;
        for (uint8_t i = 2; i < DDC_TX_LENGTH_FOR_TX - 1; i++)
        {
            checksum ^= transmission[i];
        }
        
        transmission[DDC_TX_LENGTH_FOR_TX - 1] = checksum;
        
        IOReturn txResult = IOAVServiceWriteI2C(service, TX_REGISTER >> 1, transmission[0], &transmission[1], DDC_TX_LENGTH_FOR_TX - 1);
        CFRelease(service);
        return txResult == kIOReturnSuccess;
    }
    
    return false;
}

bool getDdcConnectionForDisplay_intel(uint32_t displayId, CFTypeRef* ddcConnection)
{
    io_iterator_t iter;
    io_service_t serv, servicePort = 0;

    kern_return_t err = IOServiceGetMatchingServices(kIOMasterPortDefault,
                        IOServiceMatching("IOFramebufferI2CInterface"),
                        &iter);

    uint32_t displayNum = CGDisplayUnitNumber(displayId);

    if (err != KERN_SUCCESS)
        return 0;

    // now recurse the IOReg tree
    while ((serv = IOIteratorNext(iter)) != MACH_PORT_NULL)
    {
        CFDictionaryRef info;
        io_name_t name;
        CFStringRef location = CFSTR("");
        io_registry_entry_t parent;
        IORegistryEntryGetParentEntry(serv, kIOServicePlane, &parent);

        // get metadata from IOreg node
        IORegistryEntryGetName(parent, name);
        info = IODisplayCreateInfoDictionary(parent, kIODisplayOnlyPreferredName);
        uint32_t thisDisplay = 0;

        CFStringRef locationRef = CFDictionaryGetValue(info, CFSTR(kIODisplayLocationKey));
        if (locationRef == NULL)
        {
            return false;
        }
        location = CFStringCreateCopy(NULL, locationRef);
        
        char locationC[256] = {0};
        
        bool found = false;
        
        if (CFStringGetCString(location, &locationC[0], sizeof(locationC), kCFStringEncodingUTF8))
        {
            const char split[] = "/";
            char* token = strtok(locationC, split);
            while (token != NULL)
            {
                if (sscanf(token, "AppleIntelFramebuffer@%d", &thisDisplay) == 1)
                {
                    if (thisDisplay != displayNum)
                    {
                        break;
                    }
                    else
                    {
                        found = true;
                        break;
                    }
                } else if (sscanf(token, "ATY,Boa@%d", &thisDisplay) == 1 ) {
                    uint32_t index = getDisplayIndex(displayId);
                    if (thisDisplay != index)
                    {
                        break;
                    }
                    else
                    {
                        found = true;
                        break;
                    }
                } else if (sscanf(token, "ATY,Palena@%d", &thisDisplay) == 1 ) {
                    uint32_t index = getDisplayIndex(displayId);
                    if (thisDisplay != index)
                    {
                        break;
                    }
                    else
                    {
                        found = true;
                        break;
                    }
                }
                token = strtok(NULL, split);
            }
        }
        CFRelease(info);        

        if (found)
        {
            servicePort = serv;
            break;
        }

    }
        
    IOObjectRelease(iter);

    if (servicePort != 0)
    {
        err = IOI2CInterfaceOpen(servicePort, 0, (IOI2CConnectRef*)ddcConnection);
    }
    else
    {
        err = KERN_NOT_FOUND;
    }
    return err == KERN_SUCCESS;
}

bool getVcpCode_intel(uint32_t displayId, uint8_t code, uint32_t* result)
{
    if (isDisplayIdActive(displayId))
    {
        IOI2CRequest request;
        uint8_t response[DDC_RX_LENGTH] = {0};
        uint8_t checksum = TX_REGISTER;
        uint8_t transmission[DDC_TX_LENGTH_FOR_RX] = {0x51, 0x82, 0x01, code, 0x00};
        for (uint8_t i = 2; i < DDC_TX_LENGTH_FOR_RX - 1; i++)
        {
            checksum ^= transmission[i];
        }
        transmission[DDC_TX_LENGTH_FOR_RX - 1] = checksum;

        bzero(&request, sizeof(request));
        request.commFlags = 0;
        request.sendAddress = TX_REGISTER;
        request.sendTransactionType = kIOI2CSimpleTransactionType;
        request.sendBuffer = (vm_address_t)&transmission[0];
        request.sendBytes = DDC_TX_LENGTH_FOR_RX;
        
        IOI2CRequest reply;
        bzero(&reply, sizeof(reply));
        reply.replyTransactionType = kIOI2CSimpleTransactionType;
        reply.replyAddress = RX_REGISTER;
        reply.replySubAddress = transmission[0];
        reply.replyBuffer = (vm_address_t)&response[0];
        reply.replyBytes = DDC_RX_LENGTH;

        CFTypeRef service;
        if (getDdcConnectionForDisplay_intel(displayId, &service))
        {
            kern_return_t sendResult = IOI2CSendRequest((IOI2CConnectRef)service, kNilOptions, &request);
            if (sendResult == KERN_SUCCESS)
            {
                usleep(50000);
                kern_return_t replyResult = IOI2CSendRequest((IOI2CConnectRef)service,kNilOptions, &reply);
                IOI2CInterfaceClose((IOI2CConnectRef)service, kNilOptions);
                if (replyResult == KERN_SUCCESS)
                {
                    checksum = 0x50;
                    for (uint8_t i = 0; i < DDC_RX_LENGTH - 1; i ++)
                    {
                        checksum ^= response[i];
                    }
                
                    if (checksum != response[DDC_RX_LENGTH - 1])
                    {
                        return false;
                    }

                    *result = response[9];
                    return true;
                }
            }
            IOI2CInterfaceClose((IOI2CConnectRef)service, kNilOptions);
            usleep(50000);
        }
    }
    return false;
}

bool setVcpCode_intel(uint32_t displayId, uint8_t code, uint32_t value)
{
    if (isDisplayIdActive(displayId))
    {
        uint8_t transmission[DDC_TX_LENGTH_FOR_TX] = {0x51, 0x84, 0x03, code, ((value / 256) & 0xFF), (value & 0xFF), 0x00};
        IOI2CRequest request;
        bzero(&request, sizeof(request));
        request.commFlags = 0;
        request.sendAddress = TX_REGISTER;
        request.sendTransactionType = kIOI2CSimpleTransactionType;
        request.sendBuffer = (vm_address_t)&transmission[0];
        request.sendBytes = DDC_TX_LENGTH_FOR_TX;
        request.replyTransactionType = kIOI2CNoTransactionType;
        request.replyBytes = 0;
        uint8_t checksum = TX_REGISTER;
        for (uint8_t i = 0; i < DDC_TX_LENGTH_FOR_TX - 1; i++)
        {
            checksum ^= transmission[i];
        }
        
        transmission[DDC_TX_LENGTH_FOR_TX - 1] = checksum;
        CFTypeRef service;
        if (getDdcConnectionForDisplay_intel(displayId, &service))
        {
            kern_return_t result = IOI2CSendRequest((IOI2CConnectRef)service, kNilOptions, &request);
            IOI2CInterfaceClose((IOI2CConnectRef)service, kNilOptions);
            usleep(50000);
            return result == KERN_SUCCESS;
        }
    }
    return false;
}

bool isAppleSilicon()
{
    char model[128] = {0};
    bool result = false;
    
    size_t len = 0;
    sysctlbyname("hw.model", NULL, &len, NULL, 0);
    sysctlbyname("hw.model", &model[0], &len, NULL, 0);
    printf("%s\n", model);
    
    regex_t regex, regex2, regex3, regex4, regex5, regex6;
    uint32_t value = regcomp(&regex, "[0-9]+,[0-9]+", REG_EXTENDED|REG_ICASE);
    uint32_t value2 = regcomp(&regex2, "Air", 0);
    uint32_t value3 = regcomp(&regex3, "Pro", 0);
    uint32_t value4 = regcomp(&regex4, "mini", 0);
    uint32_t value5 = regcomp(&regex5, "iMac", 0);
    uint32_t value6 = regcomp(&regex6, "Mac", 0);

    if (value == 0)
    {
        value = regexec(&regex, model, 0, NULL, 0);
        value2 = regexec(&regex2, model, 0, NULL, 0);
        value3 = regexec(&regex3, model, 0, NULL, 0);
        value4 = regexec(&regex4, model, 0, NULL, 0);
        value5 = regexec(&regex5, model, 0, NULL, 0);

        if (value == 0)
        {
            int32_t major = 0, minor = 0;
            int32_t _result = sscanf(model, "%*[^0123456789]%s", model);
            _result = sscanf(model, "%d,%d", &major, &minor);
            
            if (_result == 2)
            {
                if (value2 == 0)
                {
                    if (major >= 10)
                    {
                        result = true;
                    }
                }
                else if (value3 == 0)
                {
                    if (major >= 17)
                    {
                        result = true;
                    }
                }
                else if (value4 == 0)
                {
                    if(major >= 9){
                        result = true;
                    }
                }
                else if (value5 == 0)
                {
                    if (major >= 21)
                    {
                        result = true;
                    }
                }
                else if (value6 == 0)
                {
                    if (major >= 13)
                    {
                        return true;
                    }
                }
            }
        }
    }
    regfree(&regex);
    regfree(&regex2);
    regfree(&regex3);
    regfree(&regex4);
    regfree(&regex5);
    regfree(&regex6);
    
    return result;
}

bool flowlib_setOrientation(uint32_t displayId, uint32_t orientation)
{
    if (isAppleSilicon())
    {
        int ret = 1;
        CGDirectDisplayID activeDisplays[MAX_DISPLAYS];
        
        void* coreDisplayHandle = dlopen("/System/Library/Frameworks/CoreDisplay.framework/CoreDisplay", RTLD_GLOBAL | RTLD_NOW);
        
        CFDictionaryRef (*getDictionary)(CGDirectDisplayID) = dlsym(coreDisplayHandle, "CoreDisplay_DisplayCreateInfoDictionary");
        
        void* skylightLibHandle = dlopen("/System/Library/PrivateFrameworks/SkyLight.framework/Versions/A/SkyLight", RTLD_NOW);
        uint32_t (*changeRotation)(uint32_t, uint32_t) = dlsym(skylightLibHandle, "SLSSetDisplayRotation");
        uint32_t numDisplays;
        CGError displayQuery = CGGetActiveDisplayList(MAX_DISPLAYS, &activeDisplays[0], &numDisplays);
        
        if (!displayQuery)
        {
            if (isDisplayIdActive(displayId))
            {
                CFDictionaryRef displayInfo = getDictionary(displayId);
                if (displayInfo != NULL)
                {
                    const void* rotationOk = CFDictionaryGetValue(displayInfo, CFSTR("kCGDisplaySupportsRotation"));
                    if (rotationOk != NULL && rotationOk)
                    {
                        uint32_t rotationResult = changeRotation(displayId, orientation);
                        ret = rotationResult;
                    }
                }
            }
        }
        
        dlclose(coreDisplayHandle);
        dlclose(skylightLibHandle);
        return ret == 0;
    }
    else
    {
        uint32_t rotationType = 0;
        switch (orientation)
        {
        case 0:
        default:
        {
            rotationType = kIOScaleRotate0;
            break;
        }
        case 90:
        {
            rotationType = kIOScaleRotate90;
            break;
        }
        case 180:
        {
            rotationType = kIOScaleRotate180;
            break;
        }
        case 270:
        {
            rotationType = kIOScaleRotate270;
            break;
        }
        }
        if (isDisplayIdActive(displayId))
        {
            io_service_t service = CGDisplayIOServicePort(displayId);
            IOOptionBits options = (0x00000400 | (rotationType)  << 16);
            IOServiceRequestProbe(service, options);
            return true;
        }
    }

    return false;
}

bool initialiseDdcMethods()
{
    if (getVcpCode == NULL && setVcpCode == NULL)
    {
        if (isAppleSilicon())
        {
            getVcpCode = getVcpCode_m1;
            setVcpCode = setVcpCode_m1;
        }
        else
        {
            getVcpCode = getVcpCode_intel;
            setVcpCode = setVcpCode_intel;
        }
    }
    return true;
}


#endif
