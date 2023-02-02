#ifndef shortcut_h
#define shortcut_h

#ifdef __cplusplus
extern "C" {
#endif

#ifdef _WIN32
    #include <windows.h>
    #include <cstdint>
#else
    #include <ApplicationServices/ApplicationServices.h>
    #include <CoreFoundation/CoreFoundation.h>
#endif



bool tabWindow();
#ifdef _WIN32
    bool keyDown(uint32_t keyCode);
    bool keyUp(uint32_t keyCode);
    bool keyStroke(uint32_t keyCode);
    bool keyCombination(uint32_t keyCode_1, uint32_t keyCode_2);
#else
    bool keyDown(uint16_t keyCode);
    bool keyUp(uint16_t keyCode);
    bool keyStroke(uint16_t keyCode);
    bool keyCombination(uint16_t keyCode_1, uint16_t keyCode_2);
    bool holdShift(bool keyUp);
#endif

#ifdef __cplusplus
}
#endif

#endif