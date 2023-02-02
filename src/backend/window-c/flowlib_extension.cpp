#pragma comment (lib,"dxgi.lib")
#include <stdio.h>
#include <vector>
#include <locale>
#include <codecvt>

#ifdef _WIN32

#include <windows.h>
#include <dxgi.h>
#include "flowlib_extension.h"
#include "helpers.h"

#include <atlbase.h>
#include <iostream>

void getPathsAndModes(std::vector<DISPLAYCONFIG_PATH_INFO>& pathArray, std::vector<DISPLAYCONFIG_MODE_INFO>& modeArray);

int flowlibEXT_count_cards(void)
{
	int nCards = 0;
	CComPtr<IDXGIFactory1> Factory;
	HRESULT hr = CreateDXGIFactory1(__uuidof(IDXGIFactory1), (void**)(&Factory));
	if (FAILED(hr))
		return 0;
	for (int j = 0;; j++)
	{
		CComPtr<IDXGIAdapter1> adapter;
		hr = Factory->EnumAdapters1(j, &adapter);
		if (FAILED(hr))
			break;
		DXGI_ADAPTER_DESC1 desc;
		adapter->GetDesc1(&desc);
		if (!(desc.Flags & DXGI_ADAPTER_FLAG_SOFTWARE))
		{
			nCards++;
		}
	}
	return nCards;
}

bool SourceNameEqual(const DISPLAYCONFIG_PATH_INFO& path, const char* name)
{
    DISPLAYCONFIG_SOURCE_DEVICE_NAME sdn{ DISPLAYCONFIG_DEVICE_INFO_GET_SOURCE_NAME, sizeof sdn, path.sourceInfo.adapterId, path.sourceInfo.id };
    LONG err = DisplayConfigGetDeviceInfo(&sdn.header);
    if (err != ERROR_SUCCESS)
    {
        return false;
    }
    std::string sourceName = to_string(sdn.viewGdiDeviceName);
    return sourceName == std::string(name);
}

int FindActivePathBySrcName(const std::vector<DISPLAYCONFIG_PATH_INFO>& pathArray, const char* name)
{
    for (int i = 0; i < pathArray.size(); i++)
    {
        if (pathArray[i].flags & DISPLAYCONFIG_PATH_ACTIVE && SourceNameEqual(pathArray[i], name))
        {
            return i;
        }
    }
    return -1;
}

int FindAvailablePathByDstName(const std::vector<DISPLAYCONFIG_PATH_INFO>& pathArray, const char* name)
{
    for (int i = 0; i < pathArray.size(); i++)
    {
        if (pathArray[i].targetInfo.targetAvailable && SourceNameEqual(pathArray[i], name))
        {
            return i;
        }
    }
    return -1;
}

void getPathsAndModes(std::vector<DISPLAYCONFIG_PATH_INFO>& pathArray, std::vector<DISPLAYCONFIG_MODE_INFO>& modeArray)
{
    UINT32 cPath = 0;
    UINT32 cMode = 0;
    LONG hr;
    hr = GetDisplayConfigBufferSizes(QDC_ALL_PATHS, &cPath, &cMode);
    pathArray.resize(cPath);
    modeArray.resize(cMode);
    hr = QueryDisplayConfig(QDC_ALL_PATHS, &cPath, &pathArray[0], &cMode, &modeArray[0], NULL);
    pathArray.resize(cPath);
    modeArray.resize(cMode);
}

void GetSourceName(LUID adapterId, UINT32 id, std::string& sourceName, std::string& adapterName)
{
    DISPLAYCONFIG_SOURCE_DEVICE_NAME sdn{ DISPLAYCONFIG_DEVICE_INFO_GET_SOURCE_NAME, sizeof sdn, adapterId, id };
    DISPLAYCONFIG_ADAPTER_NAME an{ DISPLAYCONFIG_DEVICE_INFO_GET_ADAPTER_NAME, sizeof an, adapterId, id };
    LONG err = DisplayConfigGetDeviceInfo(&sdn.header);
    if (err != ERROR_SUCCESS)
    {
        return;
    }
    err = DisplayConfigGetDeviceInfo(&an.header);
    if (err != ERROR_SUCCESS)
    {
        return;
    }
    sourceName = to_string(sdn.viewGdiDeviceName);
    adapterName = to_string(an.adapterDevicePath);
}

void GetTargetName(LUID adapterId, UINT32 id, std::string& targetName, std::string& adapterName)
{
    DISPLAYCONFIG_TARGET_DEVICE_NAME tdn{ DISPLAYCONFIG_DEVICE_INFO_GET_TARGET_NAME, sizeof tdn, adapterId, id };
    DISPLAYCONFIG_ADAPTER_NAME an{ DISPLAYCONFIG_DEVICE_INFO_GET_ADAPTER_NAME, sizeof an, adapterId, id };
    LONG err = DisplayConfigGetDeviceInfo(&tdn.header);
    if (err != ERROR_SUCCESS)
    {
        return;
    }
    err = DisplayConfigGetDeviceInfo(&an.header);
    if (err != ERROR_SUCCESS)
    {
        return;
    }
    targetName = to_string(tdn.monitorFriendlyDeviceName);
    adapterName = to_string(an.adapterDevicePath);
}

bool flowlibEXT_getDisplayFriendlyName(std::string& displayId, std::string* friendlyName)
{
    std::vector<DISPLAYCONFIG_PATH_INFO> pathArray;
    std::vector<DISPLAYCONFIG_MODE_INFO> modeArray;
    getPathsAndModes(pathArray, modeArray);
    UINT32 counter = 0;
    UINT32 checkActive = 0;
    for (UINT32 j = 0; j < pathArray.size(); j++) {
        if (pathArray[j].flags & DISPLAYCONFIG_PATH_ACTIVE)
        {
            std::string sourceName, adapterName, targetName;
            GetSourceName(pathArray[j].sourceInfo.adapterId, pathArray[j].sourceInfo.id, sourceName, adapterName);
            if (sourceName == displayId)
            {
                GetTargetName(pathArray[j].targetInfo.adapterId, pathArray[j].targetInfo.id, targetName, adapterName);
                *friendlyName = targetName;
                return true;
            }
        }
    }
    
    *friendlyName = "";
    return true;
}

bool flowlibEXT_getDisplayMirrorState(std::string& displayId, bool* isMirrored)
{
    std::vector<DISPLAYCONFIG_PATH_INFO> pathArray;
    std::vector<DISPLAYCONFIG_MODE_INFO> modeArray;
    getPathsAndModes(pathArray, modeArray);

    uint32_t locationInPaths = 0;
    uint32_t sourceModeId = 0;
    for (uint32_t i = 0; i < pathArray.size(); i++)
    {
        if (pathArray[i].flags & DISPLAYCONFIG_PATH_ACTIVE) {
            std::string sourceName, adapterName, targetName;
            GetSourceName(pathArray[i].sourceInfo.adapterId, pathArray[i].sourceInfo.id, sourceName, adapterName);
            if (sourceName == displayId) {
                locationInPaths = i;
                sourceModeId = pathArray[i].sourceInfo.modeInfoIdx;
                break;
            }
        }
    }

    for (uint32_t i = 0; i < pathArray.size(); i++)
    {
        if (pathArray[i].flags & DISPLAYCONFIG_PATH_ACTIVE) {
            if (i != locationInPaths) {
                if (pathArray[i].sourceInfo.modeInfoIdx == sourceModeId) {
                    *isMirrored = true;
                    return true;
                }

            }
        }
    }
    *isMirrored = false;
    return true;
}

bool flowlibEXT_cloneDisplays(const char* displayId, const char* to)
{
    std::vector<DISPLAYCONFIG_PATH_INFO> pathArray;
    std::vector<DISPLAYCONFIG_MODE_INFO> modeArray;
    getPathsAndModes(pathArray, modeArray);

    UINT32 activePathIndex = 0;
    UINT32 activeTargetId = 0;

    int srcIdx = FindActivePathBySrcName(pathArray, displayId);
    if (srcIdx == -1)
    {
        return false;
    }

    int dstIdx = FindAvailablePathByDstName(pathArray, to);
    if (dstIdx == -1)
    {
        return false;
    }

    pathArray[dstIdx].flags |= DISPLAYCONFIG_PATH_ACTIVE;
    pathArray[dstIdx].sourceInfo.modeInfoIdx = pathArray[srcIdx].sourceInfo.modeInfoIdx;   //same source
    pathArray[dstIdx].sourceInfo.id = pathArray[srcIdx].sourceInfo.id;       //same source
    LONG hr = SetDisplayConfig(pathArray.size(), pathArray.data(), modeArray.size(), modeArray.data(), SDC_APPLY | SDC_USE_SUPPLIED_DISPLAY_CONFIG | SDC_ALLOW_CHANGES | SDC_SAVE_TO_DATABASE);
    std::cout << "clone: SetDisplayConfig returned: " << hr << "\n";
    return hr;
}

bool flowlibEXT_cloneTwoGraphics()
{
	UINT32 pathSize, modeSize;
	GetDisplayConfigBufferSizes(QDC_ALL_PATHS, &pathSize, &modeSize);
	std::vector<DISPLAYCONFIG_PATH_INFO> pathArray(pathSize);
	std::vector<DISPLAYCONFIG_MODE_INFO> modeArray(modeSize);
    
	SecureZeroMemory(&pathArray[0],
		sizeof(DISPLAYCONFIG_PATH_INFO) *
		pathArray.size());

	SecureZeroMemory(&modeArray[0],
		sizeof(DISPLAYCONFIG_MODE_INFO) *
		modeArray.size());

	QueryDisplayConfig(QDC_ALL_PATHS, &pathSize, &pathArray[0], &modeSize, &modeArray[0], NULL);
	SetDisplayConfig(0, NULL, 0, NULL, SDC_TOPOLOGY_CLONE | SDC_APPLY);

	return true;
}


bool flowlibEXT_extendAll()
{
	UINT32 pathSize, modeSize;
	GetDisplayConfigBufferSizes(QDC_ALL_PATHS, &pathSize, &modeSize);
	std::vector<DISPLAYCONFIG_PATH_INFO> pathArray(pathSize);
	std::vector<DISPLAYCONFIG_MODE_INFO> modeArray(modeSize);

	// Fills a block of memory with zeros.
	SecureZeroMemory(&pathArray[0],
		sizeof(DISPLAYCONFIG_PATH_INFO) *
		pathArray.size());

	SecureZeroMemory(&modeArray[0],
		sizeof(DISPLAYCONFIG_MODE_INFO) *
		modeArray.size());

	QueryDisplayConfig(QDC_ALL_PATHS, &pathSize, &pathArray[0], &modeSize, &modeArray[0], NULL);

	//SetDisplayConfig(0, NULL, 0, NULL, SDC_TOPOLOGY_CLONE | SDC_APPLY);

	SetDisplayConfig(0, NULL, 0, NULL, SDC_TOPOLOGY_EXTEND | SDC_APPLY);
	return true;
}

#endif
