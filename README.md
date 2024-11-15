# Metadata Skeleton Offline Processor

This project processes metadata for datasets, programs, permissions, and visualizations from JSON files to create a final package for end users. It reads the data from specified directories, processes it, and outputs the results to an output directory.

## Prerequisites

- Node.js (>=14.x)
- npm (>=6.x) or yarn (>=1.x)

## Installation

1. Clone the repository:

    git clone https://github.com/yourusername/metadata-skeleton-offline-2.git
    cd metadata-skeleton-offline-2


2. Install the dependencies:

    ```sh
    npm install
    ```

    or

    ```sh
    yarn install
    ```

## Project Structure

- `src/`: Contains the source code.
- `capture/`: Directory for dataset and program JSON files.
- `visualizations/`: Directory for visualization JSON files.
- `permissions/`: Directory for permission JSON files.
- `output/`: Directory where processed output will be saved.

## Running the Project

To start the project, run the following command:

yarn start