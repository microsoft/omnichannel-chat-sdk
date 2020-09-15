import NotificationLevel from "./Notification";

export default interface INotification {
    id: string;
    message: string;
    level: NotificationLevel;
}