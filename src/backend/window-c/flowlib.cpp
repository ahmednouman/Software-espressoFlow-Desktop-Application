#ifdef _WIN32

#pragma comment(lib, "Dxva2.lib")
#include <PhysicalMonitorEnumerationAPI.h>
#include <LowLevelMonitorConfigurationAPI.h>
#include <Windows.h>

#include "flowlib.h"
#include "helpers.h"
#include "flowlib_extension.h"
#include "flowlib_workspace.h"

// VCP Code Definition
#define BRIGHTNESS 0x10
#define CONTRAST 0x12
#define ORIENTATION 0xAA
#define COLOR_PRESET 0x14
#define VOLUME 0x62
#define POWER_MODE 0xD6

static std::vector<PHYSICAL_MONITOR> physicalMonitors{};
static std::string matchingId;
static uint32_t displayIndex;
static uint32_t location;
static uint32_t display_count;
static std::string idPlaceholder;

static std::string deviceName;

static int option = 0;
static int32_t lft, tp, rght, btm;

BOOL CALLBACK monitorEnumProcCallback(HMONITOR hMonitor, HDC hDeviceContext, LPRECT rect, LPARAM data)
{
    MONITORINFOEX info;
    info.cbSize = sizeof(info);

    DWORD numberOfPhysicalMonitors;
    BOOL success = GetNumberOfPhysicalMonitorsFromHMONITOR(hMonitor, &numberOfPhysicalMonitors);
    if (success)
    {
        auto originalSize = physicalMonitors.size();
        physicalMonitors.resize(physicalMonitors.size() + numberOfPhysicalMonitors);
        success = GetPhysicalMonitorsFromHMONITOR(hMonitor, numberOfPhysicalMonitors, physicalMonitors.data() + originalSize);

        GetMonitorInfo(hMonitor, (LPMONITORINFO)&info);
        std::string str(info.szDevice);
        if (info.szDevice == matchingId)
        {
            if (option == 0){
                displayIndex = location;
            }
            else{
                MONITORINFO infox;
                infox.cbSize = sizeof(infox);
                GetMonitorInfo(hMonitor, (LPMONITORINFO)&infox);
                lft = infox.rcWork.left;
                tp = infox.rcWork.top;
                rght = infox.rcWork.right;
                btm = infox.rcWork.bottom;
            }         
        }
        location++;
        display_count++;
    }
    return true;
}

int getVcp(char* displayId, uint8_t vcpCode, uint32_t* value) {

    std::string id(displayId);
    std::string filteredId = filter_device_name(id);
    matchingId = filteredId;
    EnumDisplayMonitors(NULL, NULL, &monitorEnumProcCallback, 0);

    if (display_count != physicalMonitors.size()) {
        int offset = physicalMonitors.size() - display_count;
        displayIndex = displayIndex + offset;
    }

    auto physicalMonitorHandle = physicalMonitors[displayIndex].hPhysicalMonitor;

    location = 0;
    display_count = 0;
    physicalMonitors.clear();

    DWORD currentValue;
    bool success = GetVCPFeatureAndVCPFeatureReply(physicalMonitorHandle, vcpCode, NULL, &currentValue, NULL);
    *value = currentValue;
    DestroyPhysicalMonitors(physicalMonitors.size(), physicalMonitors.data());
    return success;
}

int setVcp(char* displayId, uint8_t vcpCode, uint32_t value)
{
    std::string id(displayId);
    std::string filteredId = filter_device_name(id);
    matchingId = filteredId;
    EnumDisplayMonitors(NULL, NULL, &monitorEnumProcCallback, 0);

    if (display_count != physicalMonitors.size()) {
        int offset = physicalMonitors.size() - display_count;
        displayIndex = displayIndex + offset;
    }

    auto physicalMonitorHandle = physicalMonitors[displayIndex].hPhysicalMonitor;

    location = 0;
    display_count = 0;
    physicalMonitors.clear();

    bool success = SetVCPFeature(physicalMonitorHandle, vcpCode, value);
    DestroyPhysicalMonitors(physicalMonitors.size(), physicalMonitors.data());
    return success;
}

bool flowlib_getDisplayIds(std::vector<std::string>& displayIds, uint32_t* numDisplays)
{

    DISPLAY_DEVICE dd;
    dd.cb = sizeof(dd);
    uint32_t deviceIndex = 0;
    uint32_t display_count = 0;
    while (EnumDisplayDevices(0, deviceIndex, &dd, 0))
    {
        std::string deviceName = dd.DeviceName;
        uint32_t monitorIndex = 0;
        while (EnumDisplayDevices(deviceName.c_str(), monitorIndex, &dd, 0))
        {
            
            displayIds.push_back(dd.DeviceName);
            ++monitorIndex;
            ++display_count;
            *numDisplays = display_count;
        }
        ++deviceIndex;
    }
    return true;
}

bool flowlib_getDisplayName(char* displayId, std::string& display_name, uint32_t resultLen)
{
    std::string friendlyName;
    std::string id(displayId);
    std::string filterId = filter_device_name(id);
    if (flowlibEXT_getDisplayFriendlyName(filterId, &friendlyName))
    {
        display_name = friendlyName;
        return true;
    }
    return false;
}

bool flowlib_getDisplayHashId(char* displayId, uint32_t* hashId)
{
    std::string id(displayId);
    std::string filterId = filter_device_name(id);
    uint32_t code = SuperFastHash(filterId.c_str(), filterId.size());
    *hashId = code;
    return true;
}

bool flowlib_getDisplayMirrorState(char* displayId, bool* isMirrored)
{
    std::string id(displayId);
    std::string filterId = filter_device_name(id);
    flowlibEXT_getDisplayMirrorState(filterId, isMirrored);
    return true;
}

bool enumerate_devices(char* displayId, DEVMODE* dm)
{
    std::string id(displayId);
    DISPLAY_DEVICE dd;
    dd.cb = sizeof(dd);

    uint32_t deviceIndex = 0;
    
    while (EnumDisplayDevices(0, deviceIndex, &dd, 0))
    {
        deviceName = dd.DeviceName;
        uint32_t monitorIndex = 0;
        while (EnumDisplayDevices(deviceName.c_str(), monitorIndex, &dd, 0))
        {
            uint32_t check = strcmp(displayId, dd.DeviceName);
            if (check == 0)
            {
                dm->dmSize = sizeof(DEVMODE);
                dm->dmDriverExtra = 0;
                EnumDisplaySettings(deviceName.c_str(), ENUM_CURRENT_SETTINGS, dm);
                return true;
            }

            ++monitorIndex;
        }
        ++deviceIndex;
    }
    return false;
}

bool flowlib_getIsMainDisplayId(char* displayId)
{
  DEVMODE dm;
  bool enumeration = enumerate_devices(displayId, &dm);
  if(enumeration)
  {
      uint32_t x = dm.dmPosition.x;
      uint32_t y = dm.dmPosition.y;
      return x == 0 && y == 0;
  }
  return false;
}

bool flowlib_getDisplayResolution(char* displayId, uint32_t* x, uint32_t* y)
{
    DEVMODE dm;
    bool enumeration = enumerate_devices(displayId, &dm);
    if (enumeration)
    {
        *x = dm.dmPelsWidth;
        *y = dm.dmPelsHeight;
        return true;
    }
    return false;
}

bool flowlib_getDisplayWorkingArea(char* displayId, int32_t* left, int32_t* top, int32_t* right, int32_t* bottom)
{
    std::string id(displayId);
    std::string filteredId = filter_device_name(id);
    matchingId = filteredId;
    option = 1;
    EnumDisplayMonitors(NULL, NULL, &monitorEnumProcCallback, 0);
    *left = lft;
    *top = tp;
    *right = rght;
    *bottom = btm;
    option = 0;
    physicalMonitors.clear();
    DestroyPhysicalMonitors(physicalMonitors.size(), physicalMonitors.data());
    return true;
}

bool flowlib_getDisplayLocation(char* displayId, int32_t* x, int32_t* y)
{
    DEVMODE dm;
    bool enumeration = enumerate_devices(displayId, &dm);
    if (enumeration)
    {
        *x = dm.dmPosition.x;
        *y = dm.dmPosition.y;
        return true;
    }
    return false;
}

bool flowlib_getDisplayOrientation(char* displayId, uint32_t* orientation)
{
    DEVMODE dm;
    bool enumeration = enumerate_devices(displayId, &dm);
    if (enumeration)
    {
        uint32_t conv[] = { 0, 90, 180, 270 };
        uint32_t val = dm.dmDisplayOrientation;
        *orientation = conv[val];
        return true;
    }
    return false;
}

bool flowlib_setOrientation(char* displayId, uint32_t orientation)
{
    DEVMODE dm;
    bool enumeration = enumerate_devices(displayId, &dm);
    if (enumeration)
    {
        switch (orientation)
        {
            default:
            case 0:
            {
                if (dm.dmDisplayOrientation == DMDO_90 || dm.dmDisplayOrientation == DMDO_270)
                {
                    DWORD height = dm.dmPelsHeight;
                    DWORD width = dm.dmPelsWidth;
                    dm.dmPelsWidth = height;
                    dm.dmPelsHeight = width;
                }
                dm.dmDisplayOrientation = DMDO_DEFAULT;
                break;
            }
            case 90:
            {
                if (dm.dmDisplayOrientation == DMDO_DEFAULT || dm.dmDisplayOrientation == DMDO_180)
                {
                    DWORD height = dm.dmPelsHeight;
                    DWORD width = dm.dmPelsWidth;
                    dm.dmPelsWidth = height;
                    dm.dmPelsHeight = width;
                }
                dm.dmDisplayOrientation = DMDO_90;
                break;
            }
            case 180:
            {
                if (dm.dmDisplayOrientation == DMDO_90 || dm.dmDisplayOrientation == DMDO_270)
                {
                    DWORD height = dm.dmPelsHeight;
                    DWORD width = dm.dmPelsWidth;
                    dm.dmPelsWidth = height;
                    dm.dmPelsHeight = width;
                }
                dm.dmDisplayOrientation = DMDO_180;
                break;
            }
            case 270:
            {
                if (dm.dmDisplayOrientation == DMDO_DEFAULT || dm.dmDisplayOrientation == DMDO_180)
                {
                    DWORD height = dm.dmPelsHeight;
                    DWORD width = dm.dmPelsWidth;
                    dm.dmPelsWidth = height;
                    dm.dmPelsHeight = width;
                }
                dm.dmDisplayOrientation = DMDO_270;
                break;
            }
        }
        ChangeDisplaySettingsEx(deviceName.c_str(), &dm, NULL, CDS_UPDATEREGISTRY, NULL);
        return true;
    }
    return false;
}

bool flowlib_setLocation(std::vector<std::string> displayIds, int32_t* xs, int32_t* ys, uint32_t numDisplays) 
{
    for (uint32_t i = 0; i < numDisplays; i++)
    {
        std::string id = displayIds[i];
        char* id_char = &id[0];
        DEVMODE dm;
        bool enumeration = enumerate_devices(id_char, &dm);
        if (enumeration)
        {
            dm.dmFields = DM_POSITION;
            dm.dmPosition.x = xs[i];
            dm.dmPosition.y = ys[i];
            ChangeDisplaySettingsEx(deviceName.c_str(), &dm, NULL, (CDS_UPDATEREGISTRY | CDS_NORESET), NULL);
        }
    }
    ChangeDisplaySettingsEx(NULL, NULL, NULL, 0, NULL);
    return true;
}

bool flowlib_getRotation(char* displayId, uint32_t* rotation)
{
    return getVcp(displayId, ORIENTATION, rotation);
}

bool flowlib_getBrightness(char* displayId, uint32_t* brightness)
{
    return getVcp(displayId, BRIGHTNESS, brightness);
}
bool flowlib_getContrast(char* displayId, uint32_t* contrast)
{
    return getVcp(displayId, CONTRAST, contrast);
}
bool flowlib_getColourPreset(char* displayId, uint32_t* preset)
{
    return getVcp(displayId, COLOR_PRESET, preset);
}
bool flowlib_getVolume(char* displayId, uint32_t* volume)
{
    return getVcp(displayId, VOLUME, volume);
}

bool flowlib_setBrightness(char* displayId, uint32_t brightness)
{
    return setVcp(displayId, BRIGHTNESS, brightness);
}

extern bool flowlib_setContrast(char* displayId, uint32_t contrast)
{
    return setVcp(displayId, CONTRAST, contrast);
}

extern bool flowlib_setColourPreset(char* displayId, uint32_t preset)
{
    return setVcp(displayId, COLOR_PRESET, preset);
}

extern bool flowlib_setVolume(char* displayId, uint32_t volume)
{
    return setVcp(displayId, VOLUME, volume);
}



bool flowlib_setMirrorMode(char* displayId, bool enable)
{
    int cards_num = flowlibEXT_count_cards();
    if(cards_num == 1){
        if (enable)
        {
            std::vector<std::string> displayIds;
            uint32_t numDisplays;
            bool isMain;

            char* to_displayId_conv;
            char* from;

            std::string id(displayId);
            std::string to_filterId = filter_device_name(id);
            to_displayId_conv = &to_filterId[0];

            flowlib_getDisplayIds(displayIds, &numDisplays);
            for (int i = 0; i < displayIds.size(); i++)
            {
                std::string str = displayIds[i];
                from = &str[0];
                isMain = flowlib_getIsMainDisplayId(from);
                if (isMain)
                {
                    std::string to(from);
                    std::string to_filterId = filter_device_name(to);
                    from = &to_filterId[0];
                    return flowlibEXT_cloneDisplays(from, to_displayId_conv);
                    break;
                }
            }
            return false;
        }

        return flowlibEXT_extendAll();
    }
    else
    {
        if(enable)
        {
            return flowlibEXT_cloneTwoGraphics();
        }
        else
        {
            return flowlibEXT_extendAll();
        }
    }
}


bool flowlib_getAllApps(std::vector<std::string>& path, uint32_t* numApps)
{
    
    vector <string> app_paths =  getAppsPath();

    path = app_paths;
    *numApps = app_paths.size();

    return true;
}

bool flowlib_windowMaximise()
{
   windowMaximize();
   return true;
}

bool flowlib_launchApp(char* path, int pos, char* displayId)
{
   std::string app_path(path);
   std::string display_id(displayId);
   std::string filtered_id = filter_device_name(display_id);
   launchAppInPos(app_path, pos, filtered_id);

   return true;
}

bool flowlib_windowSnap(int pos)
{

 snapWindowPositionShotcut(pos);
 return true;
}

bool flowlib_sendWindowToNextDisplay()
{
    sendToNextScreen();
    return true;
}

bool flowlib_launchWebURL(vector<string> urls,int pos, char* displayId){
    std::string display_id(displayId);
    std::string filtered_id = filter_device_name(display_id);
    webBrowserAppLaunch(urls, pos, filtered_id);
    
    return true;
}

bool flowlib_setNumOfAppsToLaunch(int num){
    setNumOfApp(num);
    return true;
}



#endif