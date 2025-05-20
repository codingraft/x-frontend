export interface FormatPostDate {
    (createdAt: string | number | Date): string;
}

export const formatPostDate: FormatPostDate = (createdAt) => {
    const currentDate = new Date();
    const createdAtDate = new Date(createdAt);

    const timeDifferenceInSeconds = Math.floor((currentDate.getTime() - createdAtDate.getTime()) / 1000);
    const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
    const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
    const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);

    if (timeDifferenceInDays > 1) {
        return createdAtDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (timeDifferenceInDays === 1) {
        return "1d";
    } else if (timeDifferenceInHours >= 1) {
        return `${timeDifferenceInHours}h`;
    } else if (timeDifferenceInMinutes >= 1) {
        return `${timeDifferenceInMinutes}m`;
    } else {
        return "Just now";
    }
};

export interface FormatMemberSinceDate {
    (createdAt: string | number | Date): string;
}

export const formatMemberSinceDate: FormatMemberSinceDate = (createdAt) => {
    const date: Date = new Date(createdAt);
    const months: string[] = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const month: string = months[date.getMonth()];
    const year: number = date.getFullYear();
    return `Joined ${month} ${year}`;
};