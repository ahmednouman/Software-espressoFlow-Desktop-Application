#include "shortcut.h"
#include <node_api.h>
#include <assert.h>


static bool extractKeyCodeIdSingleArg(napi_env env, napi_callback_info info, uint32_t* keyCode)
{
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    napi_valuetype valuetype0;
    napi_typeof(env, args[0], &valuetype0);

    if (valuetype0 != napi_number)
    {
        napi_throw_type_error(env, NULL, "Wrong arguments");
        return false;
    }
    napi_get_value_uint32(env, args[0], keyCode);
    return true;
}

static bool extractKeyCodeIdSingleArgBool(napi_env env, napi_callback_info info, bool* keyUp)
{
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    napi_valuetype valuetype0;
    napi_typeof(env, args[0], &valuetype0);

    if (valuetype0 != napi_boolean)
    {
        napi_throw_type_error(env, NULL, "Wrong arguments");
        return false;
    }
    napi_get_value_bool(env, args[0], keyUp);
    return true;
}

static bool extractKeyCodeIdDoubleArg(napi_env env, napi_callback_info info, uint32_t* keyCode1, uint32_t* keyCode2)
{
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    napi_valuetype valuetype0;
    napi_valuetype valuetype1;
    napi_typeof(env, args[0], &valuetype0);
    napi_typeof(env, args[1], &valuetype1);

    if (valuetype0 != napi_number || valuetype1 != napi_number)
    {
        napi_throw_type_error(env, NULL, "Wrong arguments");
        return false;
    }
    napi_get_value_uint32(env, args[0], keyCode1);
    napi_get_value_uint32(env, args[1], keyCode2);
    return true;
}



static napi_value shortcut_keyDown(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t keyCode = 0x0;
    if (extractKeyCodeIdSingleArg(env, info, &keyCode))
    {
       keyDown(keyCode);
       napi_create_uint32(env, keyCode, &value);
    }
    return value;

}

static napi_value shortcut_keyUp(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t keyCode = 0x0;
    if (extractKeyCodeIdSingleArg(env, info, &keyCode))
    {
       keyUp(keyCode);
        napi_create_uint32(env, keyCode, &value);
    }
    return value;
}

static napi_value shortcut_keyStroke(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t keyCode = 0x10;
    if (extractKeyCodeIdSingleArg(env, info, &keyCode))
    {
        keyStroke(keyCode);
        napi_create_uint32(env, keyCode, &value);
    }
    return value;
}

static napi_value shortcut_keyCombination(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    uint32_t keyCode1 = 0x37;
    uint32_t keyCode2 = 0x08;

    // keyCombination(keyCode1, keyCode2);
    // napi_create_uint32(env, keyCode1, &value);
    
    if (extractKeyCodeIdDoubleArg(env, info, &keyCode1, &keyCode2))
    {
        keyCombination(keyCode1, keyCode2);
        napi_create_uint32(env, keyCode1, &value);
    }
    return value;
}


static napi_value shortcut_tabWindow(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    tabWindow();
    napi_create_uint32(env, 1, &value);
    return value;
}

static napi_value shortcut_holdShift(napi_env env, napi_callback_info info)
{
    napi_value value = NULL;
    bool keyUp = false;
    if(extractKeyCodeIdSingleArgBool(env, info, &keyUp))
    {
        holdShift(keyUp);
        napi_create_uint32(env, keyUp, &value);
    }
    return value;
}

// static napi_value shortcut_keyCombinationSequence(napi_env env, napi_callback_info info)
// {
//     napi_value value = NULL;

//     size_t argc = 1;
//     napi_value args[1];
//     napi_status status;

//     status = napi_get_cb_info(env, info, &argc, args, NULL, NULL);  
//     napi_valuetype valuetype0;
//     status = napi_typeof(env, args[0], &valuetype0);  
//     uint32_t i, length;
//     status = napi_get_array_length(env, args[0], &length);
//     uint32_t * keyCodes;
//     keyCodes = new uint32_t[length];
//     //uint32_t keyCodes[length] = {};

//     if(length % 2 != 0){
//         return value;
//     }

//     for (i = 0; i < length; i++)
//     {
//         napi_value e;
//         status = napi_get_element(env, args[0], i, &e);
//         uint32_t myint;
//         napi_get_value_uint32(env, e, &myint);
//         keyCodes[i] = myint;
//     }

//     keyCombinationSequence(keyCodes, length);

//     delete[] keyCodes;

//     return value;
// }

static napi_value Init(napi_env env, napi_value exports)
{
    napi_value fn;

    napi_create_function(env, NULL, 0, shortcut_keyUp, NULL, &fn);
    napi_set_named_property(env, exports, "keyUp", fn);

    napi_create_function(env, NULL, 0, shortcut_keyDown, NULL, &fn);
    napi_set_named_property(env, exports, "keyDown", fn);

    napi_create_function(env, NULL, 0, shortcut_keyStroke, NULL, &fn);
    napi_set_named_property(env, exports, "keyStroke", fn);

    napi_create_function(env, NULL, 0, shortcut_keyCombination, NULL, &fn);
    napi_set_named_property(env, exports, "keyCombination", fn);

    napi_create_function(env, NULL, 0, shortcut_tabWindow, NULL, &fn);
    napi_set_named_property(env, exports, "tabWindow", fn);

    napi_create_function(env, NULL, 0, shortcut_holdShift, NULL, &fn);
    napi_set_named_property(env, exports, "holdShift", fn);

    // napi_create_function(env, NULL, 0, shortcut_keyCombinationSequence, NULL, &fn);
    // napi_set_named_property(env, exports, "keyCombinationSequence", fn);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
