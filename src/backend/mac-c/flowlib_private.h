//
//  flowlib_private.h
//  flowlib
//
//  Created by Christopher Hook on 27/01/2022.
//

#ifndef flowlib_private_h
#define flowlib_private_h

#ifdef __cplusplus
extern "C" {
#endif

#include <stdio.h>
#include <stdbool.h>
#include <stdint.h>

#define MAX_DISPLAYS 8

bool isDisplayIdActive(uint32_t displayId);

bool coreDisplayPropertyValue(char* result, uint32_t resultLen, const char* property, uint32_t displayId);

bool getExternalDisplayNumberForDisplayId(uint32_t displayId, uint32_t* externalNumber);

bool getInternalDisplayBrightness(float* brightness);

bool initialiseDdcMethods();

bool (*getVcpCode)(uint32_t displayId, uint8_t code, uint32_t* result);

bool (*setVcpCode)(uint32_t displayId, uint8_t code, uint32_t value);

#ifdef __cplusplus
}
#endif

#endif /* flowlib_private_h */
