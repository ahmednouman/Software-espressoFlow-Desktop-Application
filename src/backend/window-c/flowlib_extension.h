#ifndef FLOWLIB_EXTENSION_H
#define FLOWLIB_EXTENSION_H

#ifdef _WIN32

#include <cstdbool>
#include <string>



int flowlibEXT_count_cards(void);
extern bool flowlibEXT_getDisplayFriendlyName(std::string& displayId, std::string* friendlyName);
extern bool flowlibEXT_getDisplayMirrorState(std::string& displayId, bool* isMirrored);
extern bool flowlibEXT_cloneDisplays(const char* displayId, const char* to);
extern bool flowlibEXT_cloneTwoGraphics();
extern bool flowlibEXT_extendAll();

#endif
#endif
