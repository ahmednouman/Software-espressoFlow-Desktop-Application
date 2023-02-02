{
  "targets": [
    {
      "target_name": "flowlibmac",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "./src/backend/mac-c/flowlib.c",
        "./src/backend/mac-c/flowlib_private.c",
        "./src/backend/mac-c/flowlib_wrapper.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
        "./src/backend/windows-c/"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    },
    {
      "target_name": "flowlibwin",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
       "./src/backend/window-c/flowlibwin_wrapper.cpp",
       "./src/backend/window-c/flowlib.cpp",
       "./src/backend/window-c/flowlib_extension.cpp",
       "./src/backend/window-c/helpers.cpp",
       "./src/backend/window-c/flowlib_workspace.cpp"
     ],
    },
    # {
    #    "target_name": "flowshortcutlib",
    #    "cflags!": [ "-fno-exceptions" ],
    #    "cflags_cc!": [ "-fno-exceptions" ],
    #    "sources": [
    #      "./src/backend/shortcut/shortcut.c",
    #      "./src/backend/shortcut/shortcutlib_wrapper.cpp"
    #    ],
    #    "include_dirs": [
    #      "<!@(node -p \"require('node-addon-api').include\")"
    #      "./src/backend/shortcut"
    #     ],
    #    'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    #  }
  ]
}



