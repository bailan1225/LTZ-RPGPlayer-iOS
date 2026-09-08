# -*- coding: utf-8 -*-
import io, re, os
roots = [r"C:\Users\admin\Desktop\new\ipa\RPGPlayer\NativePlayer\RPGPlayer",
         r"C:\Users\admin\Desktop\new\ipa\RPGPlayer\TranslateTool\RPGTranslate"]
files = ["GameViewController.swift", "GameDetector.swift", "TranslatorConfig.swift",
         "SettingsViewController.swift", "TranslatorEngine.swift", "DataTranslator.swift",
         "TranslateViewController.swift"]
for root in roots:
    for name in files:
        p = os.path.join(root, name)
        if not os.path.exists(p):
            continue
        lines = io.open(p, encoding="utf-8").read().splitlines()
        bad = []
        for i, ln in enumerate(lines, 1):
            st = ln.strip()
            if not st:
                continue
            if st.startswith("//") or st.startswith("///") or st.startswith("*"):
                continue
            if re.search(r"[\u4e00-\u9fff]", st) and not re.search(r'["(){};=]', st):
                bad.append((i, st))
        print(name, "->", bad if bad else "clean")
