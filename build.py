#!/usr/bin/env python3
"""
Static site generator for Finance Tools
Renders Jinja2 templates to static HTML files
"""

import os
import shutil
import json
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

# Project paths
PROJECT_ROOT = Path(__file__).parent
TEMPLATES_DIR = PROJECT_ROOT / 'templates'
STATIC_DIR = PROJECT_ROOT / 'static'
DIST_DIR = PROJECT_ROOT / 'dist'
TAX_DATA_PATH = STATIC_DIR / 'data' / 'tax.json'


def clean_output():
    """Remove existing dist/ directory"""
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir()
    print(f"[OK] Cleaned output directory: {DIST_DIR}")


def load_tax_data():
    """Load tax.json for injection into templates"""
    if not TAX_DATA_PATH.exists():
        print(f"[WARN] Tax data not found at {TAX_DATA_PATH}")
        return {}

    with open(TAX_DATA_PATH, 'r') as f:
        data = json.load(f)
    print(f"[OK] Loaded tax data from {TAX_DATA_PATH}")
    return data


def copy_static_assets():
    """Copy JS/CSS/data files to dist/static"""
    dest = DIST_DIR / 'static'

    if STATIC_DIR.exists():
        shutil.copytree(STATIC_DIR, dest)
        print(f"[OK] Copied static assets to {dest}")
    else:
        print(f"[WARN] Static directory not found at {STATIC_DIR}")


def render_page(env, template_name, output_name, context=None):
    """Render a single page template to HTML"""
    if context is None:
        context = {}

    try:
        template = env.get_template(f'pages/{template_name}')
        html = template.render(**context)

        output_path = DIST_DIR / output_name
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)

        print(f"[OK] Rendered {template_name} -> {output_name}")
        return True
    except Exception as e:
        print(f"[ERROR] Error rendering {template_name}: {e}")
        return False


def build():
    """Orchestrate full build process"""
    print("\nBuilding Finance Tools static site...\n")

    # Step 1: Clean output directory
    clean_output()

    # Step 2: Load tax data
    tax_data = load_tax_data()

    # Step 3: Copy static assets
    copy_static_assets()

    # Step 4: Set up Jinja2 environment
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=True,
        trim_blocks=True,
        lstrip_blocks=True
    )
    print(f"[OK] Initialized Jinja2 environment")

    # Step 5: Render all pages
    print("\nRendering pages...")
    pages = [
        ('home.html', 'index.html', {}),
        ('loan-calculator.html', 'loan-calculator.html', {}),
        ('borrowing-capacity.html', 'borrowing-capacity.html', {}),
        ('refinance.html', 'refinance.html', {}),
        ('buy-vs-rent.html', 'buy-vs-rent.html', {}),
        ('take-home.html', 'take-home.html', {'tax_data': tax_data}),
        ('simple-investment.html', 'simple-investment.html', {}),
        ('investment-options.html', 'investment-options.html', {}),
    ]

    success_count = 0
    for template_name, output_name, context in pages:
        if render_page(env, template_name, output_name, context):
            success_count += 1

    # Summary
    print(f"\nBuild complete! {success_count}/{len(pages)} pages rendered successfully")
    print(f"Output directory: {DIST_DIR}")
    print(f"\nTo preview locally, run:")
    print(f"   python -m http.server 8000 --directory dist")
    print(f"   Then open http://localhost:8000\n")


if __name__ == '__main__':
    build()
