//
//  flowlib.h
//  flowlib
//
//  Created by Christopher Hook on 27/01/2022.
//

#ifndef flowlib_h
#define flowlib_h

#ifdef __cplusplus
extern "C" {
#endif

#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

extern bool flowlib_init();

/* getDisplaysInfo */
extern bool flowlib_getDisplayIds(uint32_t* displayIds, uint32_t length, uint32_t* numDisplays);
extern bool flowlib_getDisplayName(uint32_t displayId, char* result, uint32_t resultLen);
extern bool flowlib_getDisplayMirrorState(uint32_t displayId, bool* isMirrored);
extern bool flowlib_getIsMainDisplayId(uint32_t displayId);
extern bool flowlib_getDisplayResolution(uint32_t displayId, uint32_t* x, uint32_t* y);
extern bool flowlib_getDisplayLocation(uint32_t displayId, int32_t* x, int32_t* y);
extern bool flowlib_getDisplayOrientation(uint32_t displayId, uint32_t* orientation);

/* VCP Controls */
extern bool flowlib_getRotation(uint32_t displayId, uint32_t* rotation);
extern bool flowlib_getBrightness(uint32_t displayId, uint32_t* brightness);
extern bool flowlib_getContrast(uint32_t displayId, uint32_t* contrast);
extern bool flowlib_getColourPreset(uint32_t displayId, uint32_t* preset);
extern bool flowlib_getVolume(uint32_t displayId, uint32_t* volume);
extern bool flowlib_setBrightness(uint32_t displayId, uint32_t brightness);
extern bool flowlib_setContrast(uint32_t displayId, uint32_t contrast);
extern bool flowlib_setColourPreset(uint32_t displayId, uint32_t preset);
extern bool flowlib_setVolume(uint32_t displayId, uint32_t volume);

/* OS Controls */
extern bool flowlib_setMirrorMode(uint32_t displayId, bool enable);
extern bool flowlib_setOrientation(uint32_t displayId, uint32_t orientation);
extern bool flowlib_setLocation(uint32_t* displayIds, int32_t* xs, int32_t* ys, uint32_t numDisplays);

extern bool flowlib_synchroniseBrightness(uint32_t displayId);

#ifdef __cplusplus
}
#endif

#endif /* flowlib_h */
