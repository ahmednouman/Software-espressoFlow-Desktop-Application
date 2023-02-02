
#ifdef _WIN32

#include "flowlib_workspace.h"

static vector<string> subfolders;
static vector<string> lnk_files;

vector<string> enumerate_subfolders(string folder)
{

    string file_name_path, subfolder_path;
    string fileName;
    string search_path = folder + "*";
    string root_folder = folder;
    string sub_path = "";
    WIN32_FIND_DATA fd;
    HANDLE hFind = ::FindFirstFile(search_path.c_str(), &fd);
    if (hFind != INVALID_HANDLE_VALUE) {
        do {

            fileName = fd.cFileName;
            if ((fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) {

                if ((fileName == ".") || (fileName == "..")) {
                    continue;
                }

                subfolder_path = root_folder + fd.cFileName + "\\";
                subfolders.push_back(subfolder_path);
            }

            if (!(fd.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)) {
                if (fileName.substr(fileName.find_last_of(".") + 1) == "lnk") {
                    if (fileName.find("Uninstall") != string::npos) {
                        continue;
                    }
                    file_name_path = root_folder + sub_path + fd.cFileName;
                    lnk_files.push_back(file_name_path);
                }
            }
        } while (::FindNextFile(hFind, &fd));
        ::FindClose(hFind);
    }
    return subfolders;
}

vector<string> getLNKFiles() {
    vector<string> folders = enumerate_subfolders("C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\");

    for (int i = 0; i < subfolders.size(); i++) {
        enumerate_subfolders(subfolders[i]);
    }
    subfolders.clear();
    return lnk_files;
}


HRESULT ResolveShortcut(LPCTSTR lpszShortcutPath,
     LPTSTR lpszFilePath)
{
    HRESULT hRes = E_FAIL;
    IShellLink* psl = NULL;


    TCHAR szPath[MAX_PATH];

    TCHAR szDesc[MAX_PATH];

    WIN32_FIND_DATA wfd;
    WCHAR wszTemp[MAX_PATH];

    lpszFilePath[0] = '\0';

    hRes = CoCreateInstance(CLSID_ShellLink,
        NULL,
        CLSCTX_INPROC_SERVER,
        IID_IShellLink,
        (void**)&psl);

    if (SUCCEEDED(hRes))
    {
        IPersistFile* ppf = NULL;
        psl->QueryInterface(IID_IPersistFile, (void**)&ppf);

#if !defined _UNICODE
        MultiByteToWideChar(CP_ACP, 0, lpszShortcutPath,
            -1, wszTemp, MAX_PATH);
#else
        wcsncpy(wszTemp, lpszShortcutPath, MAX_PATH);
#endif

        hRes = ppf->Load(wszTemp, STGM_READ);
        if (SUCCEEDED(hRes))
        {

            hRes = psl->Resolve(NULL, SLR_UPDATE);
            if (SUCCEEDED(hRes))
            {
                hRes = psl->GetPath(szPath,
                    MAX_PATH, &wfd, SLGP_RAWPATH);

                if (FAILED(hRes)) {
                    return hRes;
                }
                    
                hRes = psl->GetDescription(szDesc,
                    MAX_PATH);
                if (FAILED(hRes))
                    return hRes;

                lstrcpyn(lpszFilePath, szPath, MAX_PATH);

            }
        }
    }

    return hRes;
}

string getEXETarget(string lnk_file_path)
{
    CoInitialize(NULL);
    LPCTSTR lpszShortcutPath = (lnk_file_path.c_str());
    TCHAR szFilePath[MAX_PATH];

    HRESULT hRes = ResolveShortcut(lpszShortcutPath, szFilePath);
    CoUninitialize();
    string exe_path = szFilePath;
    return exe_path;
}

vector <string> getAppsPath() {
    vector <string> exe_files_list;
    string exe_path;
    vector <string> files = getLNKFiles();
    for (int i = 0; i < files.size(); i++) {
        exe_path = getEXETarget(files[i]);
        if (exe_path.substr(exe_path.find_last_of(".") + 1) == "exe" || exe_path.substr(exe_path.find_last_of(".") + 1) == "EXE") {
            exe_files_list.push_back(exe_path);
        }
    }    
    lnk_files.clear();
    return exe_files_list;
}



int cycles = 0;
int PID = 0;
int window_x, window_y, window_width, window_height;
int window_snap;
int numOfApps = 0;

HWND window_handle;
DWORD processID;

string processName;
string processNameIterator;

vector<int> AllwindowIDs;
vector<int> same_window_ids;

HWND browseHandleReset;

 DEVICE_SCALE_FACTOR monitor_sacle_factor;

int win_x_cor, win_y_cor;

bool movedFlag = false;
bool activateFlag = false;
bool forceTerminateFlag = false;
bool existingBrowserFlag = false;
bool checked = false;

string display_id;
string display_to_send;
vector <string> otherDisplayIds;
vector <string> seen_displays;
vector <string> browserFlagInfo;

RECT display_rect;
RECT browserFlagRect;

bool recognised_win_loc = false;


int snapWindow(HWND hwnd, int pos) {
    
    double scaling_factor = (monitor_sacle_factor/100.0)  ;
    if (scaling_factor == 1){
        scaling_factor = 1.2;
    }
    double x_coordinates;
    double y_coordinates ;
    double width_adj ;
    double height_adj  ;   
   // std::cout << "dimensions = " << display_rect.right - display_rect.left << " x " << display_rect.bottom - display_rect.top << " scale=" << scaling_factor  << " moni= "<< monitor_sacle_factor  << std::endl;
    switch (pos) {
        
    case 0:
        
        x_coordinates = display_rect.left - (5 * scaling_factor);
        y_coordinates = display_rect.top;
        width_adj = ((display_rect.right - display_rect.left) / 2) + (11 * scaling_factor);
        height_adj = display_rect.bottom - display_rect.top + (6 * scaling_factor) ;
        //std::cout << "left screen = " << "x=" << x_coordinates << " y=" << y_coordinates << " width= " << width_adj << " height=" <<  height_adj << std::endl;
        ShowWindow(hwnd, SW_SHOWNORMAL);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);

        break;
    case 1:
        x_coordinates = display_rect.left + ((display_rect.right - display_rect.left) / 2) - (7 * scaling_factor);
        y_coordinates = display_rect.top;
        width_adj = ((display_rect.right - display_rect.left) / 2) + (12 * scaling_factor);
        height_adj = display_rect.bottom - display_rect.top + (5 * scaling_factor) ; 
       // std::cout << "right screen = " << "x=" << x_coordinates << " y=" << y_coordinates << " width= " << width_adj << " height=" <<  height_adj << std::endl;
        ShowWindow(hwnd, SW_SHOWNORMAL);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);

        break;
    case 2:
        x_coordinates = display_rect.left - (5 * scaling_factor);
        y_coordinates = display_rect.top;
        width_adj = display_rect.right - display_rect.left + (10 * scaling_factor);
        height_adj = ((display_rect.bottom - display_rect.top) / 2) + (6 * scaling_factor) ;
        ShowWindow(hwnd, SW_SHOWNORMAL);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);

        break;
    case 3:
        x_coordinates = display_rect.left - (5 * scaling_factor);
        y_coordinates = display_rect.top + ((display_rect.bottom - display_rect.top) / 2);
        width_adj = display_rect.right - display_rect.left + (10 * scaling_factor);
        height_adj = ((display_rect.bottom - display_rect.top) / 2) + (5 * scaling_factor) ;
        ShowWindow(hwnd, SW_SHOWNORMAL);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);
        SetWindowPos(hwnd, HWND_TOP, x_coordinates, y_coordinates, width_adj, height_adj, 0);

        break;
    case 4:
        ShowWindow(hwnd, SW_SHOWNORMAL);
        SetWindowPos(hwnd, HWND_TOP, display_rect.left, display_rect.top, ((display_rect.right - display_rect.left) / 2), display_rect.bottom - display_rect.top, 0);

        ShowWindow(hwnd, SW_SHOWMAXIMIZED);
        break;
    }

    return 0;
}

BOOL CALLBACK enumWindowCallbackList(HWND hWnd, LPARAM lparam) {
    int length = GetWindowTextLength(hWnd);
    char* buffer = new char[length + 1];
    GetWindowText(hWnd, buffer, length + 1);
    std::string windowTitle(buffer);

    

    // List visible windows with a non-empty title
    if (IsWindowVisible(hWnd) && length != 0) {
        GetWindowThreadProcessId(hWnd, &processID);
        AllwindowIDs.push_back(processID);

        //std::cout << windowTitle << processID << "PID = " << PID << std::endl;

    }
    return TRUE;
}

BOOL CALLBACK enumWindowCallbackListtoGetFirst(HWND hWnd, LPARAM lparam) {
    int length = GetWindowTextLength(hWnd);
    char* buffer = new char[length + 1];
    GetWindowText(hWnd, buffer, length + 1);
    std::string windowTitle(buffer);

    if (IsWindowVisible(hWnd) && length != 0) {
        GetWindowThreadProcessId(hWnd, &processID);
        AllwindowIDs.push_back(processID);
         if ((processID == PID) && (activateFlag == false) ) {
             int maximised = GetWindowLong(hWnd, GWL_STYLE) & WS_MAXIMIZE;
             int minimised = GetWindowLong(hWnd, GWL_STYLE) & WS_MINIMIZE;
             int min_box = GetWindowLong(hWnd, GWL_STYLE) & WS_MINIMIZEBOX;
             int frame = GetWindowLong(hWnd, GWL_STYLE) & WS_DLGFRAME;
             int sizing_box = GetWindowLong(hWnd, GWL_STYLE) & WS_SIZEBOX;

             if (existingBrowserFlag) {
                  browserFlagInfo.push_back(windowTitle);
                  if (minimised != 0) {
                      browserFlagInfo.push_back("minimised");
                  }
                  else {
                      browserFlagInfo.push_back("not-minimised");
                  }
                  if (maximised != 0) {
                      browserFlagInfo.push_back("maximised");
                  }
                  else {
                      browserFlagInfo.push_back("normal");
                  }
              }

              if (minimised != 0) {     
                  ShowWindow(hWnd, SW_RESTORE);

              }

             browseHandleReset = hWnd;
             RECT rect;
             GetWindowRect(hWnd, &rect);
             SetForegroundWindow(hWnd);
             activateFlag  = true;
             browserFlagRect = rect;
             activateFlag  = true;
         }
    }
    return TRUE;
}


 BOOL CALLBACK MonitorEnumProcNextScreen(HMONITOR hMonitor,
     HDC      hdcMonitor,
     LPRECT   lprcMonitor,
     LPARAM   dwData)
 {
     MONITORINFO info;
     info.cbSize = sizeof(info);

     MONITORINFOEX infox;
     infox.cbSize = sizeof(infox);

     GetMonitorInfo(hMonitor, (LPMONITORINFO)&infox);

     if (GetMonitorInfo(hMonitor, &info))
     {
         std::string str(infox.szDevice);

         if (display_to_send == infox.szDevice) {
             display_id = infox.szDevice;
             display_rect.left = info.rcWork.left;
             display_rect.right = info.rcWork.right;
             display_rect.top = info.rcWork.top;
             display_rect.bottom = info.rcWork.bottom;    
        
             HRESULT K = GetScaleFactorForMonitor(hMonitor,  &monitor_sacle_factor);

         }
     }
     return TRUE; 
 }

 BOOL CALLBACK MonitorEnumProc(HMONITOR hMonitor,
     HDC      hdcMonitor,
     LPRECT   lprcMonitor,
     LPARAM   dwData)
 {
     MONITORINFO info;
     info.cbSize = sizeof(info);

     MONITORINFOEX infox;
     infox.cbSize = sizeof(infox);

     GetMonitorInfo(hMonitor, (LPMONITORINFO)&infox);

     if (GetMonitorInfo(hMonitor, &info))
     {
         std::string str(infox.szDevice);
        
         otherDisplayIds.push_back(infox.szDevice);

         if ((win_x_cor >= info.rcWork.left && win_x_cor < info.rcWork.right) && (win_y_cor >= info.rcWork.top && win_y_cor < info.rcWork.bottom)) {
             display_id = infox.szDevice;
             display_rect.left = info.rcWork.left;
             display_rect.right = info.rcWork.right;
             display_rect.top = info.rcWork.top;
             display_rect.bottom = info.rcWork.bottom;


             recognised_win_loc = true;
             seen_displays.push_back(display_id);
         }
     }
     return TRUE; 
 }

 BOOL CALLBACK enumWindowCallback(HWND hWnd, LPARAM lparam) {
     int length = GetWindowTextLength(hWnd);
     char* buffer = new char[length + 1];
     GetWindowText(hWnd, buffer, length + 1);
     std::string windowTitle(buffer);

     if (IsWindowVisible(hWnd) && length != 0) {
         GetWindowThreadProcessId(hWnd, &processID);
         int min_box = GetWindowLong(hWnd, GWL_STYLE) & WS_MINIMIZEBOX;
         int frame = GetWindowLong(hWnd, GWL_STYLE) & WS_DLGFRAME;
         int sizing_box = GetWindowLong(hWnd, GWL_STYLE) & WS_SIZEBOX;

         if (processID == PID && movedFlag == false && (min_box != 0 && sizing_box != 0)) {
              EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, 0);
              snapWindow(hWnd, window_snap);
             movedFlag = true;
         }
     }
     return TRUE;
 }

 BOOL CALLBACK enumWindowCallbackLauncher(HWND hWnd, LPARAM lparam) {
     int length = GetWindowTextLength(hWnd);
     char* buffer = new char[length + 1];
     GetWindowText(hWnd, buffer, length + 1);
     std::string windowTitle(buffer);

     if (IsWindowVisible(hWnd) && length != 0) {
         GetWindowThreadProcessId(hWnd, &processID);
         int min_box = GetWindowLong(hWnd, GWL_STYLE) & WS_MINIMIZEBOX;
         int frame = GetWindowLong(hWnd, GWL_STYLE) & WS_DLGFRAME;
         int sizing_box = GetWindowLong(hWnd, GWL_STYLE) & WS_SIZEBOX;
         
         if (processID == PID && movedFlag == false && (min_box != 0 && sizing_box != 0)) {
    
             EnumDisplayMonitors(NULL, NULL, MonitorEnumProcNextScreen, 0);
             snapWindow(hWnd, window_snap);
             movedFlag = true;
         }
        bool check_splash1 = windowTitle.find("Opening") != std::string::npos;
        bool check_splash2 = windowTitle.find("StartUpWindow") != std::string::npos;

         if (processID == PID && ( (check_splash1 == 0 && check_splash2 == 0) ) && (sizing_box == 0)){
             forceTerminateFlag = true;
         }
     }
     return TRUE;
 }

 bool PrintProcessNameAndID(DWORD processID)
 {
     TCHAR szProcessName[MAX_PATH] = TEXT("<unknown>");
  
     HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION |
         PROCESS_VM_READ,
         FALSE, processID);
   
     if (NULL != hProcess)
     {
         HMODULE hMod;
         DWORD cbNeeded;

         if (EnumProcessModules(hProcess, &hMod, sizeof(hMod),
             &cbNeeded))
         {
             GetModuleBaseName(hProcess, hMod, szProcessName,
                 sizeof(szProcessName) / sizeof(TCHAR));
         }
     }

     processNameIterator = szProcessName;

    std::for_each(processNameIterator.begin(), processNameIterator.end(), [](char & c) {
        c = ::tolower(c);
    });

     std::cout << "process name=" << processName << " interator=" << processNameIterator << std::endl;

     if (processNameIterator == processName) {
        // _tprintf(TEXT("%s  (PID: %u)\n"), szProcessName, processID);
         CloseHandle(hProcess);
         return true;
     }
   
     CloseHandle(hProcess);

     return false;
 }

 int findSystemProcess(void)
 {
  
     DWORD aProcesses[1024], cbNeeded, cProcesses;
     unsigned int i;
     if (!EnumProcesses(aProcesses, sizeof(aProcesses), &cbNeeded))
     {
         return 1;
     }

     cProcesses = cbNeeded / sizeof(DWORD);

     for (i = 0; i < cProcesses; i++)
     {
         if (aProcesses[i] != 0)
         {
             PrintProcessNameAndID(aProcesses[i]);
         }
     }

     return 0;
 }

 int launchApp(LPCSTR path) {
     STARTUPINFO startInfo = { 0 };
     PROCESS_INFORMATION processInfo = { 0 };
     BOOL bScucces = CreateProcess(TEXT(path), NULL, NULL, NULL, FALSE, NULL, NULL, NULL, &startInfo, &processInfo);
     LONG PID = 0;

     if (bScucces)
     {

         PID = processInfo.dwProcessId;
         std::cout << "startid" << PID << std::endl;
     }
     else
     {
         cout << "error to start" << GetLastError << endl;
     }
     return 0;
 }
 int findExistingWindowProcess(string s) {
     same_window_ids.clear();
     AllwindowIDs.clear();
     processName = s;
    std::for_each(processName.begin(), processName.end(), [](char & c) {
        c = ::tolower(c);
    });
    
     EnumWindows(enumWindowCallbackList, NULL);
 
     for (int i = 0; i < AllwindowIDs.size(); i++) {
       bool check = PrintProcessNameAndID(AllwindowIDs[i]);
       if (check) {
           same_window_ids.push_back(AllwindowIDs[i]);
       }
     }
     return 0;
 }


 int sendToDisplay(string displayID, HWND hwnd) {

     display_to_send = displayID;
     EnumDisplayMonitors(NULL, NULL, MonitorEnumProcNextScreen, 0);

     snapWindow(hwnd, LEFT);

     return 0;
 }

 int sendToNextScreen() {
     HWND hwnd;
     hwnd = GetForegroundWindow();

     RECT rect;
     GetWindowRect(hwnd, &rect);

     win_x_cor = rect.left;
     win_y_cor = rect.top;

     if (seen_displays.size() >= otherDisplayIds.size()) {
         seen_displays.clear();
     }

     otherDisplayIds.clear();
     EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, 0);

     for (int i = 0; i < otherDisplayIds.size(); i++) {
         if ( (otherDisplayIds[i] == display_id)  || (std::find(seen_displays.begin(), seen_displays.end(), otherDisplayIds[i]) != seen_displays.end())) {
             continue;
         }
         sendToDisplay(otherDisplayIds[i], hwnd);
         seen_displays.push_back(otherDisplayIds[i]);
         break;
    }

     return 0;
 }



 int snapWindowPositionShotcut(int pos) {
     HWND hwnd;
     hwnd = GetForegroundWindow();

     RECT rect;
     GetWindowRect(hwnd, &rect);

     win_x_cor = rect.left;
     win_y_cor = rect.top;

     EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, 0);

     if (!recognised_win_loc) {
         otherDisplayIds.clear();
         win_x_cor = rect.left + (rect.right - rect.left);
         win_y_cor = rect.top + (rect.bottom - rect.top);
         EnumDisplayMonitors(NULL, NULL, MonitorEnumProc, 0);
     }

     snapWindow(hwnd, pos);
     recognised_win_loc = false;
     seen_displays.clear();
     otherDisplayIds.clear();

     return 0;
 }

 int SetWindowPosition(int exitingWindowNum, int processID, int x, int y, int width, int height) {
     int num = exitingWindowNum;
     int i = 0;
     while (same_window_ids.size() == 0 || exitingWindowNum == num) {
         findExistingWindowProcess(processName);
         num = same_window_ids.size();
         i++;
         if ((exitingWindowNum == num) && (i == 50)) {
             cout << "timeout !" << endl;
             break;
         }
     }

     while (same_window_ids.size() == 0) {
         findExistingWindowProcess(processName);

     }

     PID = same_window_ids[0];

     window_x = x;
     window_y = y;
     window_width = width;
     window_height = height;
     
     while (movedFlag == false) {
         EnumWindows(enumWindowCallback, NULL);
     }
  
     movedFlag = false;
     return 0;
 }

static int  thread_counter = 0;
static bool passedFlag = false;

 void DoWork(int delay_time){
    using namespace std::literals::chrono_literals;

    while(thread_counter < delay_time){
        if(passedFlag){
            break;
        }
        std::cout << "counter=" << thread_counter << std::endl;
        std::this_thread::sleep_for(std::chrono::seconds(1));
        thread_counter++;
    }
 }


 int SetWindowSnapPosition(int exitingWindowNum, int loc, string id) {
     display_to_send = id;
     int num = exitingWindowNum;
     int i = 0;
     while (same_window_ids.size() == 0 || exitingWindowNum == num) {
         findExistingWindowProcess(processName);
         num = same_window_ids.size();
         i++;

         if ((exitingWindowNum == num) && (i == 50)) {
             cout << "timeout !" << endl;
             break;
         }
     }

     thread_counter = 0;
     std::thread worker(DoWork, 4);
    
     while (same_window_ids.size() == 0) {
        //std::cout << "is empty" << std::endl;
         findExistingWindowProcess(processName);
         if(thread_counter == 4){
            break;
         }
     
     }



     passedFlag = true;

     worker.join();
    
     if(same_window_ids.size() == 0){
        PID = 0;
     }else{
        PID = same_window_ids[0];
     }

 
     

     window_snap = loc;

     while (movedFlag == false) {
        if( PID == 0){
            break;
        }
         EnumWindows(enumWindowCallbackLauncher, NULL);
         if (forceTerminateFlag) {
             forceTerminateFlag = false;
             break;
         }
     }


     movedFlag = false;
     passedFlag = false;
     same_window_ids.clear();
     return 0;
 }

 int windowMaximize() {
     HWND hwnd;
     hwnd = GetForegroundWindow();
     ShowWindow(hwnd, SW_SHOWMAXIMIZED);
     return 0;
 }

 string getProcessNameFromPath(string path) {
     string fileName;
     fileName = path.substr(path.find_last_of("/\\") + 1);
     return fileName;
 }

 int launchAppInPos(string path, int pos, string display_id) {
     processName = getProcessNameFromPath(path);
     findExistingWindowProcess(processName);
     int num = same_window_ids.size();
     launchApp(path.c_str());
     SetWindowSnapPosition(num, pos, display_id);
     numOfApps = numOfApps - 1;
     return 0;
 }


 int callCtrlAndN() {
     // Create a generic keyboard event structure
     INPUT ip;
     ip.type = INPUT_KEYBOARD;
     ip.ki.wScan = 0;
     ip.ki.time = 0;
     ip.ki.dwExtraInfo = 0;

     //Sleep(1000);
     // Press the "Ctrl" key
     ip.ki.wVk = VK_CONTROL;
     ip.ki.dwFlags = 0; // 0 for key press
     SendInput(1, &ip, sizeof(INPUT));

     // Press the "V" key
     ip.ki.wVk = 'N';
     ip.ki.dwFlags = 0; // 0 for key press
     SendInput(1, &ip, sizeof(INPUT));

     // Release the "V" key
     ip.ki.wVk = 'N';
     ip.ki.dwFlags = KEYEVENTF_KEYUP;
     SendInput(1, &ip, sizeof(INPUT));

     // Release the "Ctrl" key
     ip.ki.wVk = VK_CONTROL;
     ip.ki.dwFlags = KEYEVENTF_KEYUP;
     SendInput(1, &ip, sizeof(INPUT));

     return 0;
 }

 bool launchTabs(vector<string> urls) {


     for (int i = 0; i < urls.size(); i++) {
         ShellExecute(NULL, "open", urls[i].c_str(), NULL, NULL, SW_SHOWNORMAL);
     }
     return true;
 }

 bool verifyTopWindow() {
     DWORD p_id;
     HWND top_win = GetForegroundWindow();

     GetWindowThreadProcessId(top_win, &p_id);

     bool win_check = PrintProcessNameAndID(p_id);
     return win_check;
 }

 int setBrowserPos(HWND hwnd, int pos, string id) {
     display_to_send = id;
     EnumDisplayMonitors(NULL, NULL, MonitorEnumProcNextScreen, 0);
     snapWindow(hwnd, pos);

     return 0;
 }

 string defaultBrowser()
 {

     std::string strBrowser;

     HKEY hKey = NULL;
     if (RegOpenKeyEx(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice", 0, KEY_READ, &hKey) == ERROR_SUCCESS)
     {

         DWORD cbData = 0;
         if (RegQueryValueEx(hKey, "Progid", NULL, NULL, NULL, &cbData) == ERROR_SUCCESS && cbData > 0)
         {
             TCHAR* psz = new TCHAR[cbData];
             if (psz != NULL)
             {
                 if (RegQueryValueEx(hKey, "Progid", NULL, NULL, (LPBYTE)psz, &cbData) == ERROR_SUCCESS)
                 {
                     strBrowser = psz;
                     return strBrowser;
                 }
                 delete[] psz;
             }
         }
         RegCloseKey(hKey);


     }
     return "";

 }


 int webBrowserAppLaunch(vector<string> urls, int pos, string id) {

     string default_browser = defaultBrowser();

     if (default_browser.find("Edge") != std::string::npos) {
          processName = "msedge.exe";
     }
     else if (default_browser.find("Chrome") != std::string::npos) {
          processName = "chrome.exe";
     }
     else if (default_browser.find("Opera") != std::string::npos) {
          processName = "opera.exe";
     }
     else {
         launchTabs(urls);
         Sleep(2000);
         HWND win = GetForegroundWindow();
         ShowWindow(win, SW_SHOWNORMAL);
         setBrowserPos(win, BOTTOM, id);
         return 0;
     }

   
     findExistingWindowProcess(processName);
     
    
     if (same_window_ids.size() > 0) {
        PID = same_window_ids[0];
        existingBrowserFlag = true;
         EnumWindows(enumWindowCallbackListtoGetFirst, NULL);
         activateFlag = false; 
         do {
             
         } while (!verifyTopWindow());
         callCtrlAndN();
     }
     

     
     launchTabs(urls);
     Sleep(1000);
     do {

     } while (!verifyTopWindow());

     HWND win = GetForegroundWindow();
     ShowWindow(win, SW_SHOWNORMAL);
     setBrowserPos(win, pos, id);


     numOfApps = numOfApps - 1;

     //restore the existing window to its original state
     if (existingBrowserFlag && checked == false) {
        // checked = true;
         existingBrowserFlag = false;

         if (browserFlagInfo[1] == "minimised") {
             ShowWindow(browseHandleReset, SW_MINIMIZE);
         }
         else if (browserFlagInfo[1] == "not-minimised") {
             Sleep(1000);
             SetForegroundWindow(browseHandleReset);
             Sleep(1000);
             SetWindowPos(browseHandleReset, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
         }
     }
     if (numOfApps > 0 && checked == false) {
         checked = true;
     }
     
     if (numOfApps == 0 && checked) {

         checked = false;
     }
   
     return 0;
 }

int setNumOfApp(int apps_num) {
     numOfApps = apps_num;
     return 0;
}
int clearNumOfApp() {
     numOfApps = 0;
     return 0;
 }

 #endif