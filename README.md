# DHIS2 Metadata Skeleton

This repository contains two main functionalities:

1. **Metadata Offline Processor** - Processes metadata for datasets, programs, permissions, and visualizations from JSON files to create a final package
2. **Metadata Comparator/Merge Tool** - A web-based tool for comparing and selectively merging DHIS2 metadata JSON files

## Prerequisites

-   Node.js (>=18.x)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Eyeseetea/dhis2-metadata-skeleton.git
    cd dhis2-metadata-skeleton
    ```

2. Install dependencies:

    ```sh
    nvm use
    yarn install
    ```

## Project Structure

-   `src/` - Source code for both CLI and web tools
-   `capture/` - Directory for dataset and program JSON files
-   `visualizations/` - Directory for visualization JSON files
-   `permissions/` - Directory for permission JSON files
-   `output/` - Directory where processed output is saved

---

## 1. Metadata Offline Processor

A command-line tool that processes metadata for datasets, programs, permissions, and visualizations from JSON files to create a final package for end users.

### Features

-   **Dataset Processing**: Read and process dataset metadata
-   **Program Processing**: Handle program metadata
-   **Permission Management**: Process permission configurations
-   **Visualization Processing**: Handle visualization definitions
-   **Batch Operations**: Process multiple metadata files and combine them into a single output package

### Usage

To run the metadata processor:

```sh
yarn start metadata build
```

This command will:

1. Read metadata files from the `capture/`, `visualizations/`, and `permissions/` directories
2. Process and validate the metadata
3. Output the processed results to the `output/` directory

---

## 2. Metadata Comparator/Merge Tool

A modern web-based tool that allows you to compare two DHIS2 metadata JSON files, visualize their differences, and selectively merge changes to create a unified metadata package.

### Features

-   **Side-by-Side Comparison**: View two metadata JSON files with syntax highlighting
-   **Visual Diff Detection**: Automatically identify and highlight differences
-   **Smart Merging**: Selectively choose which changes to include from either file
-   **Granular Control**: Accept or reject changes at the individual property level
-   **Batch Operations**: Accept all changes from left or right file with a single click
-   **Live Preview**: See the merged result in real-time before downloading
-   **Export**: Download the merged metadata as a JSON file
-   **File Upload**: Load metadata files from your computer or via command-line arguments

### Usage

#### Option 1: Load Files via Command Line

Start the comparator with file paths as arguments:

```sh
yarn start metadata compare -f=path/to/first-file.json -s=path/to/second-file.json
```

Or using the shorter alias:

```sh
yarn compare-metadata -f=path/to/first-file.json -s=path/to/second-file.json
```

Alternative long-form syntax:

```sh
yarn start metadata compare --file1=path/to/first-file.json --file2=path/to/second-file.json
```

When file paths are provided, they are automatically loaded into the comparator.

#### Option 2: Upload Files Through UI

If no file paths are provided, start the comparator:

```sh
yarn start metadata compare
```

Or:

```sh
yarn compare-metadata
```

Then:

1. Click "Upload File 1" to select your base metadata JSON file
2. Click "Upload File 2" to select the metadata file you want to compare/merge

#### Comparing and Merging

1. **Review Differences** - The tool automatically detects and displays all differences between the files
2. **Select Changes** - For each difference, choose whether to keep the change from the left or right file
3. **Preview Merged Result** - View the merged output in real-time
4. **Download Result** - Export the final merged metadata as a JSON file

---

## Development

### Run Tests

```sh
yarn test
```

### Build for Production

```sh
yarn build-folder
```
