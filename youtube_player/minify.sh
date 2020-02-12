#!/bin/bash

# HTML
cp -f index.testing.html index.html
# Replaces everything between <!-- JS START --> and <!-- JS END --> with index.min.js entry
sed -ni '/<!-- JS START -->/{:a;N;/<!-- JS END -->/!ba;N;s/.*\n/      <script src="index.min.js"><\/script>\n/};p' index.html
# Replaces everything between <!-- CSS START --> and <!-- CSS END --> with index.min.css entry
sed -ni '/<!-- CSS START -->/{:a;N;/<!-- CSS END -->/!ba;N;s/.*\n/      <link rel="stylesheet" type="text\/css" href="index.min.css">\n/};p' index.html

# TODO: Automatically minimize CSS
# TODO: Automatically minimize JS