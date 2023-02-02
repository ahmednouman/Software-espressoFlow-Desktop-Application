#include <string.h>
#include <node_api.h>
#include <string>
#include <vector>
#include <iostream>

#ifdef _WIN32

#include "helpers.h"
#include "flowlib.h"
#include "flowlib_extension.h"

#define MAX_DISPLAYS 8

static bool extractDisplayIdSingleArg(napi_env env, napi_callback_info info, char* displayId)
{
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    napi_valuetype valuetype0;
    napi_typeof(env, args[0], &valuetype0);

    if (valuetype0 != napi_string)
    {
        napi_throw_type_error(env, NULL, "Wrong arguments");
        return false;
    }

    size_t result;
    napi_get_value_string_utf8(env, args[0], displayId, 256, &result);

    return true;
}

static bool extractDisplayIdSingleIntArg(napi_env env, napi_callback_info info, int* pos)
{
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    napi_valuetype valuetype0;
    napi_typeof(env, args[0], &valuetype0);

    napi_get_value_int32(env, args[0], pos);

    return true;
}

static bool extractDisplayIdAndValueSettingArgs(napi_env env, napi_callback_info info, char* displayId, int32_t* value)
{
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    size_t result;
    napi_get_value_string_utf8(env, args[0], displayId, 256, &result);
    napi_get_value_int32(env, args[1], value);
    return true;
}

static bool extractDisplayIdPlusTwoArgs(napi_env env, napi_callback_info info, char* displayId, int* value, char* path)
{
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    size_t result0, result1;
    napi_get_value_string_utf8(env, args[0], displayId, 256, &result0);
    napi_get_value_int32(env, args[1], value);
    napi_get_value_string_utf8(env, args[2], path, 256, &result1);

    std::cout << displayId << std::endl;
    return true;
}

static bool extractDisplayIdPlusTwoArgsArray(napi_env env, napi_callback_info info, char* displayId, int* value, std::vector<std::string>*  urls)
{
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    size_t result0;
    napi_get_value_string_utf8(env, args[0], displayId, 256, &result0);
    napi_get_value_int32(env, args[1], value);
    //napi_get_value_string_utf8(env, args[2], path, 256, &result1);
    uint32_t length;
    napi_get_array_length(env, args[2], &length);

    for(uint32_t i=0; i < length; i++){
        char s[256] = {};
        size_t result2;
        napi_value e;
        napi_get_element(env, args[2], i, &e);
        napi_get_value_string_utf8(env, e, s, 256, &result2);

        std::string url = s;
        urls->push_back(url);
    }

    return true;
}

static bool extractDisplayIdAndValueSettingArgsBool(napi_env env, napi_callback_info info, char* displayId, bool* value)
{
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);
    size_t result;
    napi_get_value_string_utf8(env, args[0], displayId, 256, &result);
    napi_get_value_bool(env, args[1], value);

    return true;
}

static napi_value getDisplayIds(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t numDisplays = 0;
    std::vector<std::string> displayIds;
    static uint32_t displays[8] = {};

    if (flowlib_getDisplayIds(displayIds,  &numDisplays))
    {
        napi_create_array_with_length(env, numDisplays, &value);
        for (uint32_t i = 0; i < displayIds.size(); i++)
        {
            napi_value element = NULL;
            napi_create_string_utf8(env, displayIds[i].c_str(), displayIds[i].size(), &element);
            napi_set_element(env, value, i, element);
        }
    }

    return value;
}

static napi_value getDisplayName(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t resultLen = 0;
        std::string display_name;
        flowlib_getDisplayName(&displayId[0], display_name, resultLen);
        napi_create_string_utf8(env, display_name.c_str(), display_name.size(), &value);
    }
    return value;
}

static napi_value getDisplayHashId(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t hashId = 0;
        std::string display_name;
        flowlib_getDisplayHashId(displayId, &hashId);
        napi_create_uint32(env, hashId, &value);
    }
    return value;
}

static napi_value getDisplayMirrorState(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        bool isMirror = false;

        if (flowlib_getDisplayMirrorState(displayId, &isMirror))
        {
            uint32_t longRep = (uint32_t)isMirror;
            napi_create_uint32(env, longRep, &value);
        }
    }
    return value;
}

static napi_value getIsMainDisplayId(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        bool isMain = flowlib_getIsMainDisplayId(displayId);
        uint32_t longRep = (uint32_t)isMain;
        napi_create_uint32(env, longRep, &value);
    }
    return value;
}

static napi_value getDisplayResolution(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t x = 0;
        uint32_t y = 0;
        if (flowlib_getDisplayResolution(displayId, &x, &y))
        {
            napi_create_object(env, &value);
            napi_value obj = NULL;
            napi_create_uint32(env, x, &obj);
            napi_set_named_property(env, value, "x", obj);
            napi_create_uint32(env, y, &obj);
            napi_set_named_property(env, value, "y", obj);
        }
    }
    return value;
}

static napi_value getDisplayWorkingArea(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        int32_t left = 0;
        int32_t top = 0;
        int32_t right = 0;
        int32_t bottom = 0;
        if (flowlib_getDisplayWorkingArea(displayId, &left, &top, &right, &bottom))
        {
            napi_create_object(env, &value);
            napi_value obj = NULL;
            napi_create_int32(env, left, &obj);
            napi_set_named_property(env, value, "left", obj);
            napi_create_int32(env, top, &obj);
            napi_set_named_property(env, value, "top", obj);
            napi_create_int32(env, right, &obj);
            napi_set_named_property(env, value, "right", obj);
            napi_create_int32(env, bottom, &obj);
            napi_set_named_property(env, value, "bottom", obj);
        }
    }
    return value;
}

static napi_value getDisplayLocation(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        int32_t x = 0;
        int32_t y = 0;
        if (flowlib_getDisplayLocation(displayId, &x, &y))
        {
            napi_create_object(env, &value);
            napi_value obj = NULL;
            napi_create_int32(env, x, &obj);
            napi_set_named_property(env, value, "x", obj);
            napi_create_int32(env, y, &obj);
            napi_set_named_property(env, value, "y", obj);
        }
    }
    return value;
}

static napi_value getDisplayOrientation(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t orientation = 0;
        if (flowlib_getDisplayOrientation(displayId, &orientation))
        {
            napi_create_uint32(env, orientation, &value);
        }
    }
    return value;
}


static napi_value getRotation(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t rotation = 0;
        if (flowlib_getRotation(displayId, &rotation))
        {
            napi_create_uint32(env, rotation, &value);
        }
    }
    return value;
}

static napi_value getBrightness(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t brightness = 0;
        if (flowlib_getBrightness(displayId, &brightness))
        {
            napi_create_uint32(env, brightness, &value);
        }
    }
    return value;
}

static napi_value getContrast(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t contrast = 0;
        if (flowlib_getContrast(displayId, &contrast))
        {
            napi_create_uint32(env, contrast, &value);
        }
    }
    return value;
}

static napi_value getColourPreset(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t preset = 0;
        if (flowlib_getColourPreset(displayId, &preset))
        {
            napi_create_uint32(env, preset, &value);
        }
    }
    return value;
}

static napi_value getVolume(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    if (extractDisplayIdSingleArg(env, info, &displayId[0]))
    {
        uint32_t volume = 0;
        if (flowlib_getVolume(displayId, &volume))
        {
            napi_create_uint32(env, volume, &value);
        }
    }
    return value;
}

static napi_value setBrightness(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    int32_t settingValue = 0;
    if (extractDisplayIdAndValueSettingArgs(env, info, &displayId[0], &settingValue))
    {
        flowlib_setBrightness(displayId, settingValue);
    }

    return value;
}

static napi_value setContrast(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    int32_t settingValue = 0;
    if (extractDisplayIdAndValueSettingArgs(env, info, &displayId[0], &settingValue))
    {
        flowlib_setContrast(displayId, settingValue);
    }

    return value;
}

static napi_value setColourPreset(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    int32_t settingValue = 0;
    if (extractDisplayIdAndValueSettingArgs(env, info, &displayId[0], &settingValue))
    {
        flowlib_setColourPreset(displayId, settingValue);
    }

    return value;
}

static napi_value setVolume(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    int32_t settingValue = 0;
    if (extractDisplayIdAndValueSettingArgs(env, info, &displayId[0], &settingValue))
    {
        flowlib_setVolume(displayId, settingValue);
    }

    return value;
}

static napi_value setMirrorMode(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    bool settingValue = false;
    if (extractDisplayIdAndValueSettingArgsBool(env, info, &displayId[0], &settingValue))
    {
        flowlib_setMirrorMode(displayId, settingValue);
    }

    return value;
}

static napi_value setOrientation(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    int32_t settingValue = 0;
    if (extractDisplayIdAndValueSettingArgs(env, info, &displayId[0], &settingValue))
    {
        flowlib_setOrientation(displayId, settingValue);
    }
    return value;
}


static napi_value setLocation(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t numDisplays = 0;
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    std::vector<std::string> displayIds;
    int32_t xs[MAX_DISPLAYS] = { 0 };
    int32_t ys[MAX_DISPLAYS] = { 0 };

    if (napi_get_cb_info(env, info, &argc, args, NULL, NULL) != napi_ok)
    {
        napi_throw_error(env, NULL, "argument failure");
        return value;
    }
    value = args[0];

    bool isArray = false;
    if (napi_is_array(env, args[0], &isArray) != napi_ok)
    {
        napi_throw_error(env, NULL, "is array error");
        return value;
    }

    if (!isArray)
    {
        napi_throw_type_error(env, NULL, "Expected an array");
        return value;
    }

    if (napi_get_array_length(env, value, &numDisplays) != napi_ok)
    {
        napi_throw_error(env, NULL, "get array length error");
        return value;
    }
    for (uint8_t i = 0; i < numDisplays; i++)
    {
        napi_value element;
        if (napi_get_element(env, value, i, &element) != napi_ok)
        {
            napi_throw_error(env, NULL, "get element error");
            return value;
        }
       
        napi_value id, x, y;
        size_t result;
        if (napi_get_named_property(env, element, "id", &id) != napi_ok)
        {
            napi_throw_error(env, NULL, "get_named_property id error");
            return value;
        }
        

        if (napi_get_named_property(env, element, "x", &x) != napi_ok)
        {
            napi_throw_error(env, NULL, "get_named_property x error");
            return value;
        }

        if (napi_get_named_property(env, element, "y", &y) != napi_ok)
        {
            napi_throw_error(env, NULL, "get_named_property y error");
            return value;
        }
        char id_char[256] = {};
        if (napi_get_value_string_utf8(env, id, &id_char[0], 256, &result) != napi_ok)
        {
            napi_throw_error(env, NULL, "get string utf8 error");
            return value;
        }
        std::string id_str(&id_char[0]);
        displayIds.push_back(id_str);
       
        if (napi_get_value_int32(env, x, &xs[i]) != napi_ok)
        {
            napi_throw_error(env, NULL, "get int32 error (xs)");
            return value;
        }
        
        if (napi_get_value_int32(env, y, &ys[i]) != napi_ok)
        {
            napi_throw_error(env, NULL, "get int32 error (ys)");
            return value;
        }

    }
    
    if (!flowlib_setLocation(displayIds, xs, ys, numDisplays))
    {
        napi_throw_error(env, NULL, "SetLocation failure");
    }
    
    return value;
}

static napi_value getAllApps(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t numApps = 0;
    std::vector<std::string> appPaths;

    if (flowlib_getAllApps(appPaths,  &numApps))
    {
        napi_create_array_with_length(env, numApps, &value);
        for (uint32_t i = 0; i < appPaths.size(); i++)
        {
            napi_value element = NULL;
            napi_create_string_utf8(env, appPaths[i].c_str(), appPaths[i].size(), &element);
            napi_set_element(env, value, i, element);
        }
    }

    return value;
}

static napi_value windowMaximise(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    if (flowlib_windowMaximise())
    {

    }

    return value;
}


static napi_value sendWindowToNextDisplay(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    if (flowlib_sendWindowToNextDisplay())
    {

    }

    return value;
}

static napi_value windowSnap(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    int pos = 0;

    if(extractDisplayIdSingleIntArg( env,  info, &pos)){
    if (flowlib_windowSnap(pos))
    {

    }
    }


    return value;
}


static napi_value numOfAppstoLaunch(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    int numOfApps = 0;
    if (extractDisplayIdSingleIntArg(env, info, &numOfApps ))
    {
        flowlib_setNumOfAppsToLaunch(numOfApps);
        //flowlib_setVolume(displayId, settingValue);
        //flowlib_launchApp(path, pos, displayId);
        std::cout << numOfApps << std::endl;
    }

    return value;
}

static napi_value launchApp(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    char path[256] = {};
    int pos = 0;
    if (extractDisplayIdPlusTwoArgs(env, info, &displayId[0], &pos, &path[0]))
    {
        //flowlib_setVolume(displayId, settingValue);
        flowlib_launchApp(path, pos, displayId);
       // std::cout << path << displayId << pos << std::endl;
    }

    return value;
}

static napi_value launchWebBrowser(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    char displayId[256] = {};
    int pos = 0;
    std::vector<std::string> urls;
    if (extractDisplayIdPlusTwoArgsArray(env, info, &displayId[0], &pos, &urls))
    {

        flowlib_launchWebURL(urls, pos, displayId);
    }

    return value;
}




napi_value Init(napi_env env, napi_value exports)
{
    napi_value fn;

    napi_create_function(env, NULL, 0, getDisplayIds, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayIds", fn);

    napi_create_function(env, NULL, 0, getDisplayName, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayName", fn);

    napi_create_function(env, NULL, 0, getDisplayHashId, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayHashId", fn);

    napi_create_function(env, NULL, 0, getDisplayMirrorState, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayMirrorState", fn);

    napi_create_function(env, NULL, 0, getIsMainDisplayId, NULL, &fn);
    napi_set_named_property(env, exports, "getIsMainDisplayId", fn);
 
    napi_create_function(env, NULL, 0, getDisplayResolution, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayResolution", fn);

    napi_create_function(env, NULL, 0, getDisplayWorkingArea, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayWorkingArea", fn);

    napi_create_function(env, NULL, 0, getDisplayLocation, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayLocation", fn);
  
    napi_create_function(env, NULL, 0, getDisplayOrientation, NULL, &fn);
    napi_set_named_property(env, exports, "getDisplayOrientation", fn);

    napi_create_function(env, NULL, 0, getRotation, NULL, &fn);
    napi_set_named_property(env, exports, "getRotation", fn);
   
    napi_create_function(env, NULL, 0, getBrightness, NULL, &fn);
    napi_set_named_property(env, exports, "getBrightness", fn);

    napi_create_function(env, NULL, 0, getContrast, NULL, &fn);
    napi_set_named_property(env, exports, "getContrast", fn);

    napi_create_function(env, NULL, 0, getColourPreset, NULL, &fn);
    napi_set_named_property(env, exports, "getColourPreset", fn);

    napi_create_function(env, NULL, 0, getVolume, NULL, &fn);
    napi_set_named_property(env, exports, "getVolume", fn);

    napi_create_function(env, NULL, 0, setBrightness, NULL, &fn);
    napi_set_named_property(env, exports, "setBrightness", fn);

    napi_create_function(env, NULL, 0, setContrast, NULL, &fn);
    napi_set_named_property(env, exports, "setContrast", fn);

    napi_create_function(env, NULL, 0, setColourPreset, NULL, &fn);
    napi_set_named_property(env, exports, "setColourPreset", fn);

    napi_create_function(env, NULL, 0, setVolume, NULL, &fn);
    napi_set_named_property(env, exports, "setVolume", fn);
   
    napi_create_function(env, NULL, 0, setMirrorMode, NULL, &fn);
    napi_set_named_property(env, exports, "setMirrorMode", fn);
      
    napi_create_function(env, NULL, 0, setOrientation, NULL, &fn);
    napi_set_named_property(env, exports, "setOrientation", fn);
 
    napi_create_function(env, NULL, 0, setLocation, NULL, &fn);
    napi_set_named_property(env, exports, "setLocation", fn);

    napi_create_function(env, NULL, 0, getAllApps, NULL, &fn);
    napi_set_named_property(env, exports, "getAllApps", fn);

    napi_create_function(env, NULL, 0, windowMaximise, NULL, &fn);
    napi_set_named_property(env, exports, "windowMaximise", fn);

    napi_create_function(env, NULL, 0, launchApp, NULL, &fn);
    napi_set_named_property(env, exports, "launchApp", fn);

    napi_create_function(env, NULL, 0, windowSnap, NULL, &fn);
    napi_set_named_property(env, exports, "windowSnap", fn);

    napi_create_function(env, NULL, 0, sendWindowToNextDisplay, NULL, &fn);
    napi_set_named_property(env, exports, "sendWindowToNextDisplay", fn);

    napi_create_function(env, NULL, 0, launchWebBrowser, NULL, &fn);
    napi_set_named_property(env, exports, "launchWebBrowser", fn);

    napi_create_function(env, NULL, 0, numOfAppstoLaunch, NULL, &fn);
    napi_set_named_property(env, exports, "numOfAppstoLaunch", fn);


    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)

#endif