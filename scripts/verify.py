#!/usr/bin/env python3
"""
Mimic Human Coding Script
-------------------------
Simulates realistic human developer behavior (typing, mouse movement, file switching, 
editing) across 5 dummy JavaScript files in Visual Studio Code.
Interfaces directly with X11 / XTest via python ctypes.

Fail-Safe: Move mouse pointer to the top-left corner of the screen (0, 0) to abort.
"""

import ctypes
import time
import random
import sys
import os

# --- X11 Setup via ctypes ---
try:
    x11 = ctypes.CDLL('libX11.so.6')
    xtest = ctypes.CDLL('libXtst.so.6')
except OSError as e:
    print(f"Error loading X11/XTest libraries: {e}")
    print("Ensure you are running on an X11-based Linux desktop session.")
    sys.exit(1)

# Argument and return types setup
x11.XOpenDisplay.restype = ctypes.c_void_p
x11.XOpenDisplay.argtypes = [ctypes.c_char_p]

x11.XCloseDisplay.argtypes = [ctypes.c_void_p]

x11.XFlush.argtypes = [ctypes.c_void_p]

x11.XDefaultRootWindow.argtypes = [ctypes.c_void_p]
x11.XDefaultRootWindow.restype = ctypes.c_ulong

x11.XDefaultScreen.argtypes = [ctypes.c_void_p]
x11.XDefaultScreen.restype = ctypes.c_int

x11.XDisplayWidth.argtypes = [ctypes.c_void_p, ctypes.c_int]
x11.XDisplayWidth.restype = ctypes.c_int

x11.XDisplayHeight.argtypes = [ctypes.c_void_p, ctypes.c_int]
x11.XDisplayHeight.restype = ctypes.c_int

x11.XStringToKeysym.argtypes = [ctypes.c_char_p]
x11.XStringToKeysym.restype = ctypes.c_ulong

x11.XKeysymToKeycode.argtypes = [ctypes.c_void_p, ctypes.c_ulong]
x11.XKeysymToKeycode.restype = ctypes.c_ubyte

x11.XQueryPointer.argtypes = [
    ctypes.c_void_p,
    ctypes.c_ulong,
    ctypes.POINTER(ctypes.c_ulong),
    ctypes.POINTER(ctypes.c_ulong),
    ctypes.POINTER(ctypes.c_int),
    ctypes.POINTER(ctypes.c_int),
    ctypes.POINTER(ctypes.c_int),
    ctypes.POINTER(ctypes.c_int),
    ctypes.POINTER(ctypes.c_uint)
]
x11.XQueryPointer.restype = ctypes.c_int

xtest.XTestFakeMotionEvent.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_ulong]
xtest.XTestFakeMotionEvent.restype = ctypes.c_int

xtest.XTestFakeKeyEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_int, ctypes.c_ulong]
xtest.XTestFakeKeyEvent.restype = ctypes.c_int

xtest.XTestFakeButtonEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_int, ctypes.c_ulong]
xtest.XTestFakeButtonEvent.restype = ctypes.c_int

# Connect to X Display
display = x11.XOpenDisplay(None)
if not display:
    print("Error: Could not open default X display. Make sure DISPLAY environment variable is set.")
    sys.exit(1)

# Get Screen Dimensions
screen = x11.XDefaultScreen(display)
SCREEN_WIDTH = x11.XDisplayWidth(display, screen)
SCREEN_HEIGHT = x11.XDisplayHeight(display, screen)
ROOT_WINDOW = x11.XDefaultRootWindow(display)

# Keyboards Map Setup
UNSHIFT_MAP = {
    'A': ('a', True), 'B': ('b', True), 'C': ('c', True), 'D': ('d', True),
    'E': ('e', True), 'F': ('f', True), 'G': ('g', True), 'H': ('h', True),
    'I': ('i', True), 'J': ('j', True), 'K': ('k', True), 'L': ('l', True),
    'M': ('m', True), 'N': ('n', True), 'O': ('o', True), 'P': ('p', True),
    'Q': ('q', True), 'R': ('r', True), 'S': ('s', True), 'T': ('t', True),
    'U': ('u', True), 'V': ('v', True), 'W': ('w', True), 'X': ('x', True),
    'Y': ('y', True), 'Z': ('z', True),
    
    '~': ('grave', True),
    '!': ('1', True),
    '@': ('2', True),
    '#': ('3', True),
    '$': ('4', True),
    '%': ('5', True),
    '^': ('6', True),
    '&': ('7', True),
    '*': ('8', True),
    '(': ('9', True),
    ')': ('0', True),
    '_': ('minus', True),
    '+': ('equal', True),
    '{': ('bracketleft', True),
    '}': ('bracketright', True),
    '|': ('backslash', True),
    ':': ('semicolon', True),
    '"': ('apostrophe', True),
    '<': ('comma', True),
    '>': ('period', True),
    '?': ('slash', True),
}

KEYSYM_NAME_MAP = {
    ' ': 'space',
    '\n': 'Return',
    '\t': 'Tab',
    '`': 'grave',
    '-': 'minus',
    '=': 'equal',
    '[': 'bracketleft',
    ']': 'bracketright',
    '\\': 'backslash',
    ';': 'semicolon',
    "'": 'apostrophe',
    ',': 'comma',
    '.': 'period',
    '/': 'slash',
}

# Typo neighboring keys lookup (US QWERTY layout representation)
TYPO_MAP = {
    'a': 'qwsz', 'b': 'vghn', 'c': 'xdfv', 'd': 'ersfxc', 'e': 'wsdr',
    'f': 'rtgvcd', 'g': 'tyhbvf', 'h': 'yujnbg', 'i': 'ujko', 'j': 'uikmnh',
    'k': 'ijlm', 'l': 'okp', 'm': 'njk', 'n': 'bhjm', 'o': 'iklp',
    'p': 'ol', 'q': 'wa', 'r': 'edft', 's': 'wedxza', 't': 'rfgy',
    'u': 'yhji', 'v': 'cfgb', 'w': 'qase', 'x': 'zsdc', 'y': 'tghu',
    'z': 'asx'
}

JS_TEMPLATES = [
    "const db = require('./db');",
    "const { Client } = require('pg');",
    "const pool = new Pool(config.db);",
    "const client = await pool.connect();",
    "const query = 'SELECT * FROM accounts WHERE id = $1';",
    "const { rows } = await client.query(query, [userId]);",
    "if (rows.length === 0) { throw new Error('Account not found'); }",
    "const jwt = require('jsonwebtoken');",
    "const bcrypt = require('bcryptjs');",
    "const hash = await bcrypt.hash(password, 10);",
    "const isValid = await bcrypt.compare(password, user.hash);",
    "const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });",
    "res.setHeader('Authorization', `Bearer ${token}`);",
    "const express = require('express');",
    "const router = express.Router();",
    "router.get('/profile', authenticateToken, async (req, res) => {",
    "    try {",
    "        const profile = await db.getProfile(req.user.id);",
    "        res.json({ status: 'success', data: profile });",
    "    } catch (error) {",
    "        res.status(500).json({ error: error.message });",
    "    }",
    "});",
    "const fetch = require('node-fetch');",
    "const API_BASE = 'https://api.github.com';",
    "const headers = { 'Content-Type': 'application/json' };",
    "const res = await fetch(`${API_BASE}/users/${username}`, { headers });",
    "const payload = await res.json();",
    "return payload.public_repos || 0;",
    "const logger = require('./logger');",
    "const isProduction = process.env.NODE_ENV === 'production';",
    "const port = process.env.PORT || 8080;",
    "module.exports = { port, isProduction, logger };",
    "logger.info(`Starting server on port ${port}...`);",
    "logger.error(`Database connection failed: ${err.message}`);",
    "// TODO: Refactor login flow to use cookies instead of LocalStorage",
    "// FIXME: Fix memory leak in websocket reconnection handler",
    "// Verify auth payload structure",
    "if (!payload || typeof payload !== 'object') return false;",
]

SANDBOX_FILES = ['auth.js', 'db.js', 'router.js', 'utils.js', 'api.js']

def check_failsafe():
    rx, cx = ctypes.c_ulong(), ctypes.c_ulong()
    root_x, root_y = ctypes.c_int(), ctypes.c_int()
    win_x, win_y = ctypes.c_int(), ctypes.c_int()
    mask = ctypes.c_uint()
    
    res = x11.XQueryPointer(display, ROOT_WINDOW, ctypes.byref(rx), ctypes.byref(cx), 
                             ctypes.byref(root_x), ctypes.byref(root_y), 
                             ctypes.byref(win_x), ctypes.byref(win_y), 
                             ctypes.byref(mask))
    if res and root_x.value == 0 and root_y.value == 0:
        print("\n[FAIL-SAFE] Mouse moved to top-left corner (0,0). Exiting script.")
        x11.XCloseDisplay(display)
        sys.exit(0)
    return root_x.value, root_y.value

def get_keycode(name):
    ks = x11.XStringToKeysym(name.encode('utf-8'))
    if ks == 0:
        return 0
    return x11.XKeysymToKeycode(display, ks)

def press_keycode(keycode, down=True):
    xtest.XTestFakeKeyEvent(display, keycode, 1 if down else 0, 0)
    x11.XFlush(display)

def press_key(name, down=True):
    kc = get_keycode(name)
    if kc != 0:
        press_keycode(kc, down)

def type_char(char):
    check_failsafe()
    
    # Determine base character and shift status
    if char in UNSHIFT_MAP:
        base, shift = UNSHIFT_MAP[char]
    else:
        base, shift = char, False
        
    name = KEYSYM_NAME_MAP.get(base, base)
    kc = get_keycode(name)
    if kc == 0:
        return
        
    shift_kc = get_keycode('Shift_L')
    
    if shift:
        press_keycode(shift_kc, True)
        time.sleep(0.01)
        
    press_keycode(kc, True)
    time.sleep(0.01)
    press_keycode(kc, False)
    time.sleep(0.01)
    
    if shift:
        press_keycode(shift_kc, False)
        time.sleep(0.01)

def send_combo(modifier_name, key_name):
    mod_kc = get_keycode(modifier_name)
    key_kc = get_keycode(key_name)
    if mod_kc == 0 or key_kc == 0:
        return
        
    press_keycode(mod_kc, True)
    time.sleep(0.03)
    press_keycode(key_kc, True)
    time.sleep(0.03)
    press_keycode(key_kc, False)
    time.sleep(0.03)
    press_keycode(mod_kc, False)
    time.sleep(0.03)

# --- Mouse Simulation Functions ---

def ease_in_out(t):
    return t * t * (3 - 2 * t)

def get_bezier_point(p0, p1, p2, p3, t):
    x = (1-t)**3 * p0[0] + 3*(1-t)**2 * t * p1[0] + 3*(1-t) * t**2 * p2[0] + t**3 * p3[0]
    y = (1-t)**3 * p0[1] + 3*(1-t)**2 * t * p1[1] + 3*(1-t) * t**2 * p2[1] + t**3 * p3[1]
    return int(x), int(y)

def move_mouse_human(target_x, target_y):
    start_x, start_y = check_failsafe()
    
    dx = target_x - start_x
    dy = target_y - start_y
    distance = (dx**2 + dy**2)**0.5
    
    if distance < 5:
        return
        
    # Generate random control points in the box with some offset
    ctrl_offset = distance * random.uniform(0.1, 0.4)
    sign_x = 1 if random.random() > 0.5 else -1
    sign_y = 1 if random.random() > 0.5 else -1
    
    p0 = (start_x, start_y)
    p1 = (start_x + dx * 0.25 + sign_x * ctrl_offset, start_y + dy * 0.25 - sign_y * ctrl_offset)
    p2 = (start_x + dx * 0.75 - sign_x * ctrl_offset, start_y + dy * 0.75 + sign_y * ctrl_offset)
    p3 = (target_x, target_y)
    
    # Number of steps depends on distance
    steps = int(distance / random.uniform(6.0, 14.0))
    steps = max(20, min(steps, 120))
    
    for i in range(steps + 1):
        check_failsafe()
        t = i / steps
        t_eased = ease_in_out(t)
        x, y = get_bezier_point(p0, p1, p2, p3, t_eased)
        
        # Add micro-jitter (human tremor)
        if i < steps:
            x += random.randint(-1, 1)
            y += random.randint(-1, 1)
            
        # Ensure we stay on screen and do not trigger failsafe (x=0, y=0)
        x = max(10, min(x, SCREEN_WIDTH - 10))
        y = max(10, min(y, SCREEN_HEIGHT - 10))
        
        xtest.XTestFakeMotionEvent(display, -1, x, y, 0)
        x11.XFlush(display)
        
        # Human speed variation sleep
        sleep_time = random.uniform(0.005, 0.015)
        time.sleep(sleep_time)
        
    # Exact target finish
    xtest.XTestFakeMotionEvent(display, -1, target_x, target_y, 0)
    x11.XFlush(display)
    time.sleep(0.05)

def human_click():
    xtest.XTestFakeButtonEvent(display, 1, 1, 0)
    x11.XFlush(display)
    time.sleep(random.uniform(0.05, 0.15))
    xtest.XTestFakeButtonEvent(display, 1, 0, 0)
    x11.XFlush(display)
    time.sleep(random.uniform(0.1, 0.3))

def human_scroll(direction='down', lines=None):
    if lines is None:
        lines = random.randint(3, 10)
    button = 5 if direction == 'down' else 4
    
    for _ in range(lines):
        check_failsafe()
        xtest.XTestFakeButtonEvent(display, button, 1, 0)
        x11.XFlush(display)
        time.sleep(0.01)
        xtest.XTestFakeButtonEvent(display, button, 0, 0)
        x11.XFlush(display)
        time.sleep(random.uniform(0.05, 0.15))

# --- Human Typing Simulation Functions ---

def type_line_human(line):
    print(f"[TYPE] Typing line: {line.strip()}")
    i = 0
    while i < len(line):
        char = line[i]
        
        # Typo generation: 3% chance on letters
        if char.lower() in TYPO_MAP and random.random() < 0.03:
            typo_char = random.choice(TYPO_MAP[char.lower()])
            if char.isupper():
                typo_char = typo_char.upper()
                
            # Type typo
            type_char(typo_char)
            time.sleep(random.uniform(0.15, 0.35))
            
            # Backspace deletion
            press_key('BackSpace', True)
            time.sleep(0.02)
            press_key('BackSpace', False)
            time.sleep(random.uniform(0.1, 0.25))
            
        type_char(char)
        
        # Delay after character
        if char == ' ':
            time.sleep(random.uniform(0.15, 0.45))
        elif char in '()[]{}=;:.,+-*/&|!':
            time.sleep(random.uniform(0.15, 0.3))
        else:
            time.sleep(random.uniform(0.06, 0.18))
            
        i += 1
        
    type_char('\n')
    # Thinking/reading pause after a line
    time.sleep(random.uniform(1.2, 3.5))

def delete_chars_human(count):
    print(f"[EDIT] Backspacing last {count} characters...")
    for _ in range(count):
        check_failsafe()
        press_key('BackSpace', True)
        time.sleep(0.01)
        press_key('BackSpace', False)
        time.sleep(random.uniform(0.05, 0.12))
    time.sleep(random.uniform(0.5, 1.2))

def clear_file_human():
    print("[EDIT] Selecting all and clearing file content...")
    send_combo('Control_L', 'a')
    time.sleep(random.uniform(0.4, 0.8))
    press_key('BackSpace', True)
    time.sleep(0.02)
    press_key('BackSpace', False)
    time.sleep(random.uniform(0.5, 1.2))

def move_cursor_human():
    direction = random.choice(['Up', 'Down', 'Left', 'Right'])
    steps = random.randint(1, 5)
    print(f"[NAV] Moving cursor {direction} {steps} times")
    for _ in range(steps):
        check_failsafe()
        press_key(direction, True)
        time.sleep(0.02)
        press_key(direction, False)
        time.sleep(random.uniform(0.1, 0.25))
    time.sleep(random.uniform(0.5, 1.2))

def switch_file(filename):
    print(f"\n[SWITCH] Switching to file: {filename}")
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(workspace_dir, "sandbox", filename)
    
    import shutil
    code_bin = shutil.which('code') or '/snap/bin/code'
    
    # Focus / open the file via VS Code IPC
    os.system(f"{code_bin} {path} &")
    time.sleep(random.uniform(1.5, 2.5))

def simulate_mouse_activity():
    activity = random.choices(
        ['sweep', 'click_editor', 'scroll', 'wiggle', 'none'],
        weights=[0.3, 0.2, 0.2, 0.2, 0.1],
        k=1
    )[0]
    
    if activity == 'sweep':
        target_x = random.randint(100, SCREEN_WIDTH - 100)
        target_y = random.randint(100, SCREEN_HEIGHT - 100)
        print(f"[MOUSE] Sweeping to ({target_x}, {target_y})")
        move_mouse_human(target_x, target_y)
        
    elif activity == 'click_editor':
        target_x = SCREEN_WIDTH // 2 + random.randint(-200, 200)
        target_y = SCREEN_HEIGHT // 2 + random.randint(-150, 150)
        print(f"[MOUSE] Clicking editor at ({target_x}, {target_y})")
        move_mouse_human(target_x, target_y)
        human_click()
        
    elif activity == 'scroll':
        target_x = SCREEN_WIDTH // 2 + random.randint(-100, 100)
        target_y = SCREEN_HEIGHT // 2 + random.randint(-100, 100)
        move_mouse_human(target_x, target_y)
        direction = random.choice(['up', 'down'])
        lines = random.randint(3, 8)
        print(f"[MOUSE] Scrolling {direction} {lines} ticks")
        human_scroll(direction, lines)
        
    elif activity == 'wiggle':
        start_x, start_y = check_failsafe()
        print("[MOUSE] Wiggling pointer")
        for _ in range(random.randint(3, 6)):
            tx = start_x + random.randint(-20, 20)
            ty = start_y + random.randint(-20, 20)
            move_mouse_human(tx, ty)
            time.sleep(random.uniform(0.1, 0.25))

def main():
    print("====================================================================")
    print("                 MIMIC HUMAN DEVELOPER AUTOMATION                    ")
    print("====================================================================")
    print(f"[*] SCREEN RESOLUTION : {SCREEN_WIDTH} x {SCREEN_HEIGHT}")
    print(f"[*] TARGET SANDBOX FILES : {', '.join(SANDBOX_FILES)}")
    print("[*] FAIL-SAFE          : MOVE MOUSE TO CORNER (0, 0) TO IMMEDIATELY EXIT")
    print("====================================================================")
    
    # 1. Open the 5 sandbox files in Visual Studio Code
    print("[*] Launching target files in Visual Studio Code...")
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sandbox_paths = [os.path.join(workspace_dir, "sandbox", f) for f in SANDBOX_FILES]
    
    # Run code binary to open them as tabs
    cmd = f"/snap/bin/code {' '.join(sandbox_paths)} &"
    os.system(cmd)
    
    # 2. Countdown to allow user to switch focus
    countdown = 10
    print(f"\n[!] Preparing simulation. Focus on the VS Code window now...")
    for i in range(countdown, 0, -1):
        print(f"    Starting in {i} seconds...", end='\r')
        time.sleep(1)
        check_failsafe()
        
    print("\n[!] Starting simulation!")
    
    # Initialize active file state
    current_file = random.choice(SANDBOX_FILES)
    switch_file(current_file)
    
    file_start_time = time.time()
    file_switch_interval = random.uniform(60, 240) # 1 to 4 minutes switch interval
    
    while True:
        check_failsafe()
        
        # Check if it's time to switch file
        if time.time() - file_start_time > file_switch_interval:
            # Save file before switching
            print("[EDIT] Saving file (Ctrl + S)")
            send_combo('Control_L', 's')
            time.sleep(random.uniform(0.8, 1.5))
            
            # Select new file
            new_file = random.choice([f for f in SANDBOX_FILES if f != current_file])
            switch_file(new_file)
            current_file = new_file
            
            # Reset timer
            file_start_time = time.time()
            file_switch_interval = random.uniform(60, 240)
            continue
            
        # Select action
        action = random.choices(
            ['type_line', 'delete_chars', 'move_cursor', 'clear_file', 'mouse_activity'],
            weights=[0.60, 0.08, 0.08, 0.02, 0.22],
            k=1
        )[0]
        
        if action == 'type_line':
            line = random.choice(JS_TEMPLATES)
            type_line_human(line)
            
            # Occasionally save after typing a line
            if random.random() < 0.25:
                print("[EDIT] Saving file (Ctrl + S)")
                send_combo('Control_L', 's')
                time.sleep(random.uniform(0.5, 1.0))
                
        elif action == 'delete_chars':
            count = random.randint(3, 15)
            delete_chars_human(count)
            
        elif action == 'move_cursor':
            move_cursor_human()
            
        elif action == 'clear_file':
            clear_file_human()
            
        elif action == 'mouse_activity':
            simulate_mouse_activity()
            
        # Idle pause between tasks
        time.sleep(random.uniform(1.0, 3.5))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[!] Execution interrupted by user via terminal.")
        x11.XCloseDisplay(display)
        sys.exit(0)
