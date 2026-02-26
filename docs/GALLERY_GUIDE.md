# Portfolio Gallery Guide

This guide explains how to manage, add, and customize image galleries in your portfolio projects.

## 1. Project Structure Basics

Each project is a `<section>` with the class `project`.
The content is divided into a **header** (tab), **description**, and **galleries container**.

```html
<section class="project" id="project-X">
  
  <!-- 1. TAB HEADER -->
  <div class="project-tab">
    <div class="tab-inner">
      <h2 class="project-title">0X / Title</h2>
    </div>
  </div>

  <!-- 2. DESCRIPTION -->
  <div class="project-content">
    <p class="project-description">Your Description Here</p>
  </div>

  <!-- 3. GALLERIES CONTAINER -->
  <div class="project-galleries">
    <!-- Individual galleries go here -->
  </div>

</section>
```

---

## 2. Layout Options

You can control the layout of the galleries using the `data-layout` attribute on the `.project-galleries` container.

### A. Standard Layout (Row)
By default (no attribute), galleries are displayed in a flexible row.
- **Good for**: 1-2 large galleries.
- **Behavior**: Items sit side-by-side or stack on smaller screens.

```html
<div class="project-galleries">
  <!-- Galleries ... -->
</div>
```

### B. 2x2 Grid Layout
Use `data-layout="grid-2x2"` to create a structured grid.
- **Good for**: 4 independent galleries (e.g. form studies, variations).
- **Spacing**: 
  - **Horizontal Gap**: `2.5rem` (matches page margins).
  - **Vertical Gap**: `2px` (minimal).

```html
<div class="project-galleries" data-layout="grid-2x2">
  <!-- Gallery 1 -->
  <div class="project-gallery">...</div>
  <!-- Gallery 2 -->
  <div class="project-gallery">...</div>
  <!-- Gallery 3 -->
  <div class="project-gallery">...</div>
  <!-- Gallery 4 -->
  <div class="project-gallery">...</div>
</div>
```

---

## 3. Adding a Gallery

A "Gallery" is an interactive stack of images. When you click it, it flips to the next image.

### Structure of a Single Gallery

```html
<div class="project-gallery">
  
  <!-- Image 1 (Visible initially) -->
  <div class="gallery-item active">
    <!-- Your Image Here -->
    <img src="path/to/image1.jpg" class="project-img gallery-trigger" alt="Description">
  </div>

  <!-- Image 2 (Hidden until clicked) -->
  <div class="gallery-item">
    <img src="path/to/image2.jpg" class="project-img gallery-trigger" alt="Description">
  </div>

  <!-- You can add more items... -->

</div>
```

**Important**:
- The first `.gallery-item` needs the class `active`.
- Images should have the class `.project-img` (for real images) or `.placeholder-img` (for colored boxes).
- The class `.gallery-trigger` ensures the click interaction works.

### Using Placeholders

If you don't have images yet, you can use colored divs as placeholders:

```html
<div class="placeholder-img gallery-trigger" 
     style="background: #333; width: 100%; height: 250px; display: flex; align-items: center; justify-content: center; color: #fff;">
  [Your Label]
</div>
```

---

## 4. Scroll Depth (Sticky Behavior)

Since the project tabs are sticky, you need enough scrollable content to make the effect feel right.

### The `data-depth` Attribute
If a project feels too short (scrolling ends too quickly), add `data-depth="tall"` to the main project section.

```html
<section class="project" id="project-3" data-depth="tall">
  ...
</section>
```

- **Normal**: Default height based on content.
- **Tall**: Forces a minimum height of `180vh`. Use this for grids or projects with many images to give the user time to "digest" the content before the next tab slides up.

---

## Summary Checklist
1. **Choose Layout**: Standard or `grid-2x2`.
2. **Add Galleries**: Create `.project-gallery` divs.
3. **Add Images**: Inside each gallery, add `.gallery-item` divs. Mark the first one `active`.
4. **Check Depth**: If scrolling feels tight, add `data-depth="tall"` to the section.
