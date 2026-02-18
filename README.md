# Metadata Skeleton Offline Processor

This project processes metadata for datasets, programs, permissions, and visualizations from JSON files to create a final package for end users. It reads the data from specified directories, processes it, and outputs the results to an output directory.

## Prerequisites

-   Node.js (>=18.x)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/Eyeseetea/dhis2-metadata-skeleton.git

    cd dhis2-metadata-skeleton
    ```

2. Install the dependencies:

    ```sh
    nvm use
    ```

    ```sh
    npm install
    ```

    or

    ```sh
    yarn install
    ```

## Project Structure

-   `src/`: Contains the source code.
-   `capture/`: Directory for dataset and program JSON files.
-   `visualizations/`: Directory for visualization JSON files.
-   `permissions/`: Directory for permission JSON files.
-   `output/`: Directory where processed output will be saved.

## Running the Project

To start the project, run the following command:

1.  ```sh
    yarn start
    ```

## Metadata Comparator/Merge Tool

The metadata comparator is a tool that allows you to compare two DHIS2 metadata JSON files, visualize their differences, and selectively merge changes to create a unified metadata package.

### Features

-   **Side-by-Side Comparison**: View two metadata JSON files with syntax highlighting and difference visualization
-   **Smart Merging**: Selectively choose which changes to include from either file
-   **Granular Control**: Accept changes at the individual property level
-   **Batch Operations**: Accept all changes from left or right file with a single click
-   **Preview**: See the merged result in real-time before downloading
-   **Export**: Download the merged metadata as a JSON file

### How to Use

1.  **Launch the Comparator**
    Start the comparator with:

    ```sh
    yarn compare-metadata -f=path/to/first-file.json -s=path/to/second-file.json
    ```

    Both `-f` and `-s` are optional arguments. Alternatively, you can use the long-form syntax:

    ```sh
    yarn compare-metadata --first=path/to/first-file.json --second=path/to/second-file.json
    ```

    When file paths are provided, they will be automatically loaded into the comparator. Otherwise, you can upload files manually through the UI.

2.  **Upload Files**
    If no file paths are provided,

    -   Click "Upload File 1" to select your base metadata JSON file
    -   Click "Upload File 2" to select the metadata file you want to compare/merge

3.  Review Differences
4.  Select and Merge Changes
5.  Review Merged Output
6.  Download Result
