
#ifndef _HELPERS_H
#define _HELPERS_H


#pragma warning(disable : 4996) //_CRT_SECURE_NO_WARNINGS

#include <string>
#include <cstdint>

uint32_t SuperFastHash(const char* data, int len);

std::wstring to_wstr(const char* mbstr);
std::string to_str(const wchar_t* wcstr);
std::string convertToString(char* a, int size);
std::string to_string(std::wstring src);
std::string toUtf8(wchar_t* buffer);
std::string filter_device_name(std::string name);


#endif