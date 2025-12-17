function getLineIntersection(p1, p2, p3, p4) {
    const s1x = p2.x - p1.x;
    const s1y = p2.y - p1.y;
    const s2x = p4.x - p3.x;
    const s2y = p4.y - p3.y;

    const s =
        (-s1y * (p1.x - p3.x) + s1x * (p1.y - p3.y)) /
        (-s2x * s1y + s1x * s2y);

    const t =
        ( s2x * (p1.y - p3.y) - s2y * (p1.x - p3.x)) /
        (-s2x * s1y + s1x * s2y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return {
            x: p1.x + (t * s1x),
            y: p1.y + (t * s1y)
        };
    }
    return null;
}

function getLinesIntersection(lineA, lineB) {
    for (let i = 0; i < lineA.length - 1; i++) {
        for (let j = 0; j < lineB.length - 1; j++) {
            const hit = getLineIntersection(
                lineA[i],
                lineA[i + 1],
                lineB[j],
                lineB[j + 1]
            );
            if (hit) return hit;
        }
    }
    return null;
}
function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}
function trimPathToIntersection(points, intersection) {
    const result = [];
    for (let i = 0; i < points.length - 1; i++) {
        result.push(points[i]);

        // Если следующая точка близка к пересечению — добавляем пересечение
        if (distance(points[i + 1], intersection) < 5) {
            result.push(intersection);
            break;
        }
    }
    return result;
}
function isPortrait() {
    return window.innerHeight >= window.innerWidth;
}
function isInsideCarWithPadding(car, point, padding = 10) {
    const b = car.getBounds();
    return (
        point.x >= b.x - padding &&
        point.x <= b.x + b.width + padding &&
        point.y >= b.y - padding &&
        point.y <= b.y + b.height + padding
    );
}
export {getLineIntersection,getLinesIntersection ,distance ,trimPathToIntersection,isPortrait,isInsideCarWithPadding}