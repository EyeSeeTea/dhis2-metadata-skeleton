export const appConfig: AppConfig = {
    id: "dhis2-app-skeleton",
    appearance: {
        showShareButton: true,
    },
};
export interface AppConfig {
    id: string;
    appearance: {
        showShareButton: boolean;
    };
}
