export type ChartData = {
    points: { y: number; }[];
    title: string;
}

export type ChartFormData = {
    db: string
    level: string;
    type: string;
    count: number;
}