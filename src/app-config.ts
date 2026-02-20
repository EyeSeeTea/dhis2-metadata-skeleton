export const appConfig: AppConfig = {
    id: "dhis2-metadata-skeleton",
    appearance: {
        showShareButton: true,
    },
};
export type AppConfig = {
    id: string;
    appearance: {
        showShareButton: boolean;
    };
};
