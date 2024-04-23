import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
    name: 'avarageTime',
    standalone: true
})
export class AvaragePipe implements PipeTransform {
    transform(value: { y: number }[]): string {
        if (!value.length) {
            return ''
        }
        return `${value.reduce((acc, curr) => acc + curr.y, 0) / value.length} ms`;
    }
}