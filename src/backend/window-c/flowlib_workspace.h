#ifdef _WIN32

#pragma comment(lib, "Shcore.lib")
#include <shellscalingapi.h>

#include <windows.h>
#include <string>
#include <iostream>
#include <objidl.h>   
#include <shlobj.h>   
#include "objbase.h"
#include <vector>

#include <stdio.h>
#include <cstdlib>
#include <tchar.h>
#include <psapi.h>
#include <algorithm>
#include <thread>
#include <chrono>

#define LEFT 0
#define RIGHT 1
#define TOP 2
#define BOTTOM 3
#define MAXIMIZE 4

using namespace std;

static bool iteration_flag = false;
static bool moving_flag = false;

using namespace std;

vector<string> enumerate_subfolders(string folder);
vector<string> getLNKFiles();
HRESULT ResolveShortcut( LPCTSTR lpszShortcutPath, LPTSTR lpszFilePath);
string getEXETarget(string lnk_file_path);
vector <string> getAppsPath();

int snapWindow(HWND hwnd, int pos);
bool PrintProcessNameAndID(DWORD processID);
int findSystemProcess(void);
int launchApp(LPCSTR path);
int findExistingWindowProcess(string s);
int sendToDisplay(string displayID, HWND hwnd);
int sendToNextScreen();
int snapWindowPositionShotcut(int pos);
int SetWindowPosition(int exitingWindowNum, int processID, int x, int y, int width, int height);
int SetWindowSnapPosition(int exitingWindowNum, int loc, string id);
int windowMaximize();
string getProcessNameFromPath(string path);
int launchAppInPos(string path, int pos, string display_id);
int callCtrlAndN();
bool launchTabs(vector<string> urls);
bool verifyTopWindow();
int setBrowserPos(HWND hwnd, int pos, string id);
string defaultBrowser();
int webBrowserAppLaunch(vector<string> urls, int pos, string id);
int setNumOfApp(int apps_num);
int clearNumOfApp();

#endif
