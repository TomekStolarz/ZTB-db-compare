export type ChartData = {
    points: { y: number; }[];
    title: string;
}

export type ChartFormData = {
    db: string
    level: number;
    type: string;
    count: number;
}