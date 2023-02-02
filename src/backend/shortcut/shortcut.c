#include "shortcut.h"

#ifdef _WIN32

#define VK_D 0x44
#define VK_C 0x43

// keycode docs https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes

bool tabWindow()
{
    INPUT inputs[4] = {};
    ZeroMemory(inputs, sizeof(inputs));

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_MENU;
   
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = VK_TAB;

    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = VK_TAB;
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_MENU;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        return false;
    } 

    Sleep(500);
    return true;
}


bool keyDown(uint32_t keyCode)
{
    INPUT inputs[1] = {};
    ZeroMemory(inputs, sizeof(inputs));
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = keyCode;
    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        return false;
    } 

    return true;
}

bool keyUp(uint32_t keyCode)
{
    INPUT inputs[1] = {};
    ZeroMemory(inputs, sizeof(inputs));
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = keyCode;
    inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        return false;
    } 

    return true;
}

bool keyStroke(uint32_t keyCode)
{
    INPUT inputs[2] = {};
    ZeroMemory(inputs, sizeof(inputs));

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = keyCode;
   
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = keyCode;
    inputs[1].ki.dwFlags = KEYEVENTF_KEYUP;

    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        return false;
    } 
    return true;
}



bool keyCombination(uint32_t keyCode_1, uint32_t keyCode_2)
{
    INPUT inputs[4] = {};
    ZeroMemory(inputs, sizeof(inputs));

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = keyCode_1;
   
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = keyCode_2;

    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = keyCode_2;
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = keyCode_1;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    UINT uSent = SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
    if (uSent != ARRAYSIZE(inputs))
    {
        return false;
    } 

    return true;
}

bool keyCombinationSequence(uint32_t* keyCodes, uint32_t size)
{
    INPUT inputs[4] = {};
    ZeroMemory(inputs, sizeof(inputs));
   
    for (uint32_t i=0; i<size; i+=2)
    {  
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = keyCodes[i];

        inputs[1].type = INPUT_KEYBOARD;
        inputs[1].ki.wVk = keyCodes[i+1];

        inputs[2].type = INPUT_KEYBOARD;
        inputs[2].ki.wVk = keyCodes[i+1];
        inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

        inputs[3].type = INPUT_KEYBOARD;
        inputs[3].ki.wVk = keyCodes[i];
        inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

        Sleep(500);
    }

    return true;

}

#elif __APPLE__

bool keyUp(uint16_t keyCode)
{
    // Create an HID hardware event source
    //CGEventFlags flags = kCGEventFlagMaskShift;
    CGEventSourceRef src = CGEventSourceCreate(kCGEventSourceStateHIDSystemState);

    // Create a new keyboard key release event
    CGEventRef evt = CGEventCreateKeyboardEvent(src, (CGKeyCode) keyCode, false);
    //CGEventSetFlags(evt,flags | CGEventGetFlags(evt));
    // Post keyboard event and release
    CGEventPost (kCGSessionEventTap, evt);
    CFRelease (evt);
    CFRelease (src);
    usleep(60);
    return true;
}

bool keyDown(uint16_t keyCode)
{
    //CGEventFlags flags = kCGEventFlagMaskShift;
    CGEventSourceRef src = CGEventSourceCreate(kCGEventSourceStateHIDSystemState);
    CGEventRef evt = CGEventCreateKeyboardEvent(src, (CGKeyCode) keyCode, true);

    //CGEventSetFlags(evt,flags | CGEventGetFlags(evt));
    // Post keyboard event and release
    CGEventPost (kCGSessionEventTap, evt);
    CFRelease (evt);
    CFRelease (src);
    usleep(60);
    return true;
}

bool keyCombination(uint16_t keyCode_1, uint16_t keyCode_2){
    
    CGEventSourceRef source = CGEventSourceCreate(kCGEventSourceStateHIDSystemState);

      CGEventRef keyDown = CGEventCreateKeyboardEvent(source,  (CGKeyCode) keyCode_1, true);
        if(keyCode_2 == 0x37)
        {
            CGEventSetFlags(keyDown, kCGEventFlagMaskCommand);
        } else if (keyCode_2 == 0x38 )
        {
            CGEventSetFlags(keyDown, kCGEventFlagMaskShift);
        }
     
      CGEventRef keyUp = CGEventCreateKeyboardEvent(source,  (CGKeyCode) keyCode_1, false);

      CGEventPost(kCGSessionEventTap, keyDown);
      CGEventPost(kCGSessionEventTap, keyUp);

      CFRelease(keyUp);
      CFRelease(keyDown);
      CFRelease(source);
    usleep(60);
    return true;
}

bool tabWindow()
{
    
    CGEventSourceRef source = CGEventSourceCreate(kCGEventSourceStateHIDSystemState);

    CGEventRef keyDown = CGEventCreateKeyboardEvent(source,  (CGKeyCode) 48, true);
    CGEventSetFlags(keyDown, kCGEventFlagMaskCommand);
     
    CGEventRef keyUp = CGEventCreateKeyboardEvent(source,  (CGKeyCode) 48, false);

    CGEventPost(kCGHIDEventTap, keyDown);
    CGEventPost(kCGHIDEventTap, keyUp);

    CFRelease(keyUp);
    CFRelease(keyDown);
    CFRelease(source);
    
    sleep(1);
    return true;
}


bool keyStroke(uint16_t keyCode)
{
    keyDown(keyCode);
    keyUp(keyCode);
    return true;
}

bool holdShift(bool keyUp)
{
      
    // CGEventSourceRef source = CGEventSourceCreate( kCGEventSourceStateHIDSystemState );
    // CGEventRef keyEvent = CGEventCreateKeyboardEvent( source, (CGKeyCode) 0x38, !keyUp );

    // if(keyUp){
    //     CGEventSetFlags( keyEvent, CGEventGetFlags( keyEvent ) & ~kCGEventFlagMaskShift );
    // } else {
    //     CGEventSetFlags( keyEvent, CGEventGetFlags( keyEvent ) | kCGEventFlagMaskShift );
    // }
    
    // CGEventPost( kCGHIDEventTap, keyEvent );

    // CFRelease( keyEvent );
    // CFRelease( source );

    CGEventSourceRef eventSource = CGEventSourceCreate(kCGEventSourceStateHIDSystemState);
    CGEventRef flagsChanged = CGEventCreate(eventSource);
    CGEventSetType(flagsChanged, kCGEventFlagsChanged);
    CGEventSetIntegerValueField(flagsChanged, kCGKeyboardEventKeycode, 56);
    //CGEventSetFlags(flagsChanged, 131330);
    CGEventSetFlags(flagsChanged, kCGEventFlagMaskShift);
    //ProcessSerialNumber psn = { 0, kNoProcess };
    //GetFrontProcess( &psn );
    CGEventPost( kCGHIDEventTap, flagsChanged );
   //CGEventPostToPSN(&psn, flagsChanged);
    CFRelease(flagsChanged);
    CFRelease(eventSource);
    
    return true;
}



// int main(int argc, const char * argv[]) {
//     tabWindow();
//     keyCombination(0x09, 0x37);
//     printf("hello world");
//     return 0;
// }



#endif

