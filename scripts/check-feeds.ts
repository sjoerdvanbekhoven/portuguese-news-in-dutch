/** Controleert welke feeds bereikbaar zijn en hoeveel recente items ze leveren. */
import { collectItems } from "../lib/feeds";

const { items, report } = await collectItems({ hours: 24, perFeed: 1000 });
console.table(report);
console.log(`Totaal ${items.length} unieke items in de laatste 24 uur.`);
for (const i of items.slice(0, 5)) console.log(`- [${i.feed}] ${i.title}`);
