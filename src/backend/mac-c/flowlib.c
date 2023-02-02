//
//  flowlib.c
//  flowlib
//
//  Created by Christopher Hook on 27/01/2022.
//


#ifndef _WIN32

#include "flowlib.h"
#include "flowlib_private.h"


#include "flowlib_private_mac.h"


bool flowlib_init()
{
    return initialiseDdcMethods();
}

bool flowlib_getDisplayIds(uint32_t* displayIds, uint32_t length, uint32_t* numDisplays)
{
    CGError dErr = CGGetOnlineDisplayList(length, displayIds, numDisplays);
    if (dErr != kCGErrorSuccess)
    {
        return false;
    }
    return true;
}

bool flowlib_getDisplayName(uint32_t displayId, char* result, uint32_t resultLen)
{
    bool returnValue = false;
    void* coreDisplayHandle = dlopen("/System/Library/Frameworks/CoreDisplay.framework/CoreDisplay", RTLD_GLOBAL | RTLD_NOW);
    
    CFDictionaryRef (*getDictionary)(CGDirectDisplayID) = dlsym(coreDisplayHandle, "CoreDisplay_DisplayCreateInfoDictionary");
    
    if (isDisplayIdActive(displayId))
    {
        CFDictionaryRef displayInfo = getDictionary(displayId);
        if (displayInfo != NULL)
        {
            const void* name = CFDictionaryGetValue(displayInfo, CFSTR("DisplayProductName"));
            if (name != NULL)
            {
                const void* localisedName = CFDictionaryGetValue(name, CFSTR("en_US"));

                if (localisedName != NULL)
                {
                    CFStringRef theValue = (CFStringRef)(localisedName);
                    returnValue = CFStringGetCString(theValue, result, resultLen, kCFStringEncodingUTF8);
                }
            }
        }
    }

    dlclose(coreDisplayHandle);
    return result;
}

bool flowlib_getDisplayMirrorState(uint32_t displayId, bool* isMirrored)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    *isMirrored = CGDisplayIsInMirrorSet(displayId);
    return true;
}

bool flowlib_getIsMainDisplayId(uint32_t displayId)
{
    uint32_t mainDisplay = CGMainDisplayID();
    return displayId == mainDisplay;
}

bool flowlib_synchroniseBrightness(uint32_t displayId)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    float brightness = 0.0f;

    if (getInternalDisplayBrightness(&brightness))
    {
        float calculatedBrightness = 0.0f;

        if (brightness <= 0.25f)
        {
            calculatedBrightness = brightness / 2;
        }
        else if (brightness <= 0.5f)
        {
            calculatedBrightness = ((brightness - 0.25f) / 0.25f) *  0.625f + 0.125f; 
        }
        else if (brightness <= 0.75f)
        {
            calculatedBrightness = ((brightness - 0.5f) / 0.25f) * 0.25f + 0.75f;
        }
        else
        {
            calculatedBrightness = 1.0f;
        }
        uint32_t brightnessValue = (uint32_t) (calculatedBrightness * 100.0f);
        uint32_t currentBrightness = 0;
        bool checkBrightness = flowlib_getBrightness(displayId, &currentBrightness);

        if (checkBrightness && (brightnessValue != currentBrightness))
        {
            int32_t factor = 10;
            int32_t difference = (int32_t)(brightnessValue) - (int32_t)(currentBrightness);
            int32_t steps = 0;
            float stepsFloat = difference / factor;
            if (stepsFloat > 0 && stepsFloat < 1)
            {
                steps = 1;
            }
            else if (stepsFloat < 0 && stepsFloat > -1)
            {
                steps = -1;
            }
            else
            {
                steps = (int32_t)(stepsFloat);
            }

            for (int32_t i = 0; i < factor; i++)
            {
                flowlib_setBrightness(displayId, currentBrightness + (i * steps));
                usleep(50000);
            }

            bool result = flowlib_setBrightness(displayId, brightnessValue);
            return result;

        }
        return true;
    }
    return false;
}

bool flowlib_getDisplayResolution(uint32_t displayId, uint32_t* x, uint32_t* y)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    CGRect resolution = CGDisplayBounds(displayId);
    *x = (uint32_t)resolution.size.width;
    *y = (uint32_t)resolution.size.height;
    return true;
}

bool flowlib_getDisplayLocation(uint32_t displayId, int32_t* x, int32_t* y)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    CGRect location = CGDisplayBounds(displayId);
    *x = (int32_t)location.origin.x;
    *y = (int32_t)location.origin.y;
    return true;
}

bool flowlib_getDisplayOrientation(uint32_t displayId, uint32_t* orientation)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    *orientation = (uint32_t)CGDisplayRotation(displayId);
    return true;
}

bool flowlib_getRotation(uint32_t displayId, uint32_t* rotation)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return getVcpCode(displayId, 0xAA, rotation);
}

bool flowlib_getBrightness(uint32_t displayId, uint32_t* brightness)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return getVcpCode(displayId, 0x10, brightness);
}

bool flowlib_getContrast(uint32_t displayId, uint32_t* contrast)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return getVcpCode(displayId, 0x12, contrast);
}

bool flowlib_getColourPreset(uint32_t displayId, uint32_t* preset)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return getVcpCode(displayId, 0x14, preset);
}

bool flowlib_getVolume(uint32_t displayId, uint32_t* volume)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return getVcpCode(displayId, 0x62, volume);
}

bool flowlib_setBrightness(uint32_t displayId, uint32_t brightness)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return setVcpCode(displayId, 0x10, brightness);
}

bool flowlib_setContrast(uint32_t displayId, uint32_t contrast)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return setVcpCode(displayId, 0x12, contrast);
}

bool flowlib_setColourPreset(uint32_t displayId, uint32_t preset)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return setVcpCode(displayId, 0x14, preset);
}

bool flowlib_setVolume(uint32_t displayId, uint32_t volume)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    return setVcpCode(displayId, 0x62, volume);
}

bool flowlib_setLocation(uint32_t* displayIds, int32_t* xs, int32_t* ys, uint32_t numDisplays)
{
    for (uint8_t i = 0; i < numDisplays; i++)
    {
        if (!isDisplayIdActive(displayIds[i]))
        {
            return false;
        }
    }

    CGDisplayConfigRef configRef;
    CGError err = CGBeginDisplayConfiguration(&configRef);

    if (err != kCGErrorSuccess)
    {
        return false;
    }

    for(uint8_t i = 0; i < numDisplays; i++)
    {
        err = CGConfigureDisplayOrigin(configRef, displayIds[i],xs[i], ys[i]);
        if (err != kCGErrorSuccess)
        {
            return false;
        }
    }

    err = CGCompleteDisplayConfiguration(configRef, kCGConfigurePermanently);
    
    return err == kCGErrorSuccess;
}

bool flowlib_setMirrorMode(uint32_t displayId, bool enable)
{
    if (!isDisplayIdActive(displayId))
    {
        return false;
    }
    
    CGDisplayConfigRef configRef;
    CGError err = CGBeginDisplayConfiguration(&configRef);
    
    if (err != kCGErrorSuccess)
    {
        return false;
    }
    
    uint32_t mainDisplay = CGMainDisplayID();
    if (enable)
    {
        err = CGConfigureDisplayMirrorOfDisplay(configRef, mainDisplay, displayId);
    }
    else
    {
        err = CGConfigureDisplayMirrorOfDisplay(configRef, displayId, kCGNullDirectDisplay);
    }
    
    if (err != kCGErrorSuccess)
    {
        return false;
    }
        
    err = CGCompleteDisplayConfiguration(configRef, kCGConfigurePermanently);
    
    return err == kCGErrorSuccess;
}

#endif
