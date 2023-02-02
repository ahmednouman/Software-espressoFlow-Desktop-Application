#ifndef flowlib_h
#define flowlib_h

#include <vector>
#include <string>
#include <cstdio>
#include <cstdint>
#include <cstdbool>

extern bool flowlib_getDisplayIds(std::vector<std::string>& displayIds, uint32_t* numDisplays);
extern bool flowlib_getDisplayName(char* displayId, std::string& result, uint32_t resultLen);
extern bool flowlib_getDisplayHashId(char*  displayId, uint32_t* hashId);
extern bool flowlib_getDisplayMirrorState(char* displayId, bool* isMirrored);
extern bool flowlib_getIsMainDisplayId(char* displayId);
extern bool flowlib_getDisplayResolution(char* displayId, uint32_t* x, uint32_t* y);
extern bool flowlib_getDisplayWorkingArea(char* displayId, int32_t* left, int32_t* top, int32_t* right, int32_t* bottom);
extern bool flowlib_getDisplayLocation(char* displayId, int32_t* x, int32_t* y);
extern bool flowlib_getDisplayOrientation(char* displayId, uint32_t* orientation);

// VCP Controls 
extern bool flowlib_getRotation(char* displayId, uint32_t* rotation);
extern bool flowlib_getBrightness(char* displayId, uint32_t* brightness);
extern bool flowlib_getContrast(char* displayId, uint32_t* contrast);
extern bool flowlib_getColourPreset(char* displayId, uint32_t* preset);
extern bool flowlib_getVolume(char* displayId, uint32_t* volume);
extern bool flowlib_setBrightness(char* displayId, uint32_t brightness);
extern bool flowlib_setContrast(char* displayId, uint32_t contrast);
extern bool flowlib_setColourPreset(char* displayId, uint32_t preset);
extern bool flowlib_setVolume(char* displayId, uint32_t volume);

// OS Controls 
extern bool flowlib_setMirrorMode(char* displayId, bool enable);
extern bool flowlib_setOrientation(char* displayId, uint32_t orientation);
extern bool flowlib_setLocation(std::vector<std::string> displayIds, int32_t* xs, int32_t* ys, uint32_t numDisplays);

//workspace
bool flowlib_getAllApps(std::vector<std::string>& path, uint32_t* numApps);
bool flowlib_windowMaximise();
bool flowlib_launchApp(char* path, int pos, char* displayId);
bool flowlib_windowSnap(int pos);
bool flowlib_sendWindowToNextDisplay();
bool flowlib_launchWebURL(std::vector<std::string> urls, int pos, char* displayId);
bool flowlib_setNumOfAppsToLaunch(int num);

#endif /* flowlib_h */
