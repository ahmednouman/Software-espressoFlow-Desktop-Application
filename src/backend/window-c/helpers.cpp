#ifdef _WIN32

#include <clocale>
#include <locale>
#include <codecvt>
#include <atlstr.h>
#include "helpers.h"

#include <stdint.h>
#include <stdlib.h>

#undef get16bits
#if (defined(__GNUC__) && defined(__i386__)) || defined(__WATCOMC__) \
  || defined(_MSC_VER) || defined (__BORLANDC__) || defined (__TURBOC__)
#define get16bits(d) (*((const uint16_t *) (d)))
#endif
#if !defined (get16bits)
#define get16bits(d) ((((uint32_t)(((const uint8_t *)(d))[1])) << 8)\
                       +(uint32_t)(((const uint8_t *)(d))[0]) )
#endif
uint32_t SuperFastHash(const char* data, int len) {
    uint32_t hash = len, tmp;
    int rem;
    if (len <= 0 || data == NULL) return 0;
    rem = len & 3;
    len >>= 2;
    /* Main loop */
    for (; len > 0; len--) {
        hash += get16bits(data);
        tmp = (get16bits(data + 2) << 11) ^ hash;
        hash = (hash << 16) ^ tmp;
        data += 2 * sizeof(uint16_t);
        hash += hash >> 11;
    }
    /* Handle end cases */
    switch (rem) {
    case 3: hash += get16bits(data);
        hash ^= hash << 16;
        hash ^= ((signed char)data[sizeof(uint16_t)]) << 18;
        hash += hash >> 11;
        break;
    case 2: hash += get16bits(data);
        hash ^= hash << 11;
        hash += hash >> 17;
        break;
    case 1: hash += (signed char)*data;
        hash ^= hash << 10;
        hash += hash >> 1;
    }
    /* Force "avalanching" of final 127 bits */
    hash ^= hash << 3;
    hash += hash >> 5;
    hash ^= hash << 4;
    hash += hash >> 17;
    hash ^= hash << 25;
    hash += hash >> 6;
    return hash;
}


// convert from const char* to const wchar_t*
std::wstring to_wstr(const char* mbstr)
{
    std::mbstate_t state{};

    const char* p = mbstr;

    // get the number of characters
    // when successfully converted
    size_t clen = mbsrtowcs(NULL, &p, 0, &state);

    if (clen == 0)
        return L""; //failed to calculate the character length 

    std::wstring rlt(clen, L'\0');

    size_t converted = mbsrtowcs(&rlt[0], &mbstr, rlt.size(), &state);

    if (converted == static_cast<std::size_t>(-1))
        return L"";
    else
        return rlt;

}

std::string to_str(const wchar_t* wcstr)
{
    if (wcstr == NULL || wcslen(wcstr) == 0)
        return"";

    std::mbstate_t state{};

    const wchar_t* p = wcstr;

    size_t clen = wcsrtombs(NULL, &p, 0, &state);

    if (clen == 0 || clen == static_cast<std::size_t>(-1))
        return "";

    std::string rlt(clen, '\0');

    size_t converted = wcsrtombs(&rlt[0], &wcstr, rlt.size(), &state);

    if (converted == static_cast<std::size_t>(-1))
    {
        return"";

    }
    else {
        return rlt;
    }
}

std::string convertToString(char* a, int size)
{
    int i;
    std::string s = "";
    for (i = 0; i < size; i++) {
        s = s + a[i];

    }
    return s;
}

std::string to_string(std::wstring src)
{
    using convert_type = std::codecvt_utf8<wchar_t>;
    std::wstring_convert<convert_type, wchar_t> converter;
    return converter.to_bytes(src);
}

std::string toUtf8(wchar_t* buffer)
{
    CW2A utf8(buffer, CP_UTF8);
    const char* data = utf8.m_psz;
    return std::string{ data };
}

std::string filter_device_name(std::string name)
{
    std::string filtered_name;
    char ch[] = "\\";
    size_t found = 0;
    size_t i = 0;
    int num = 0;
    while(true)
    {
        found = name.find(ch, found);
         if (found != std::string::npos)
         {
             found = found + 1;
             num++;
             if (num == 4)
             {
                 filtered_name = name.substr(0, found-1);
                 return filtered_name;
             }
         }
         else
         {
             break;
         }
     }
    return filtered_name;
}


#endif