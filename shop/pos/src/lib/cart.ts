export interface CartLine {
  id: string;
  title: string;
  unitAmount: number;
  currency: string;
  quantity: number;
  thumbnail?: string | null;
}

export function addLine(lines: readonly CartLine[], line: Omit<CartLine, "quantity">): CartLine[] {
  const existing = lines.find((candidate) => candidate.id === line.id);
  if (existing) {
    return lines.map((candidate) =>
      candidate.id === line.id ? { ...candidate, quantity: candidate.quantity + 1 } : candidate,
    );
  }
  return [...lines, { ...line, quantity: 1 }];
}

export function setQuantity(lines: readonly CartLine[], id: string, quantity: number): CartLine[] {
  if (quantity <= 0) {
    return lines.filter((line) => line.id !== id);
  }
  return lines.map((line) => (line.id === id ? { ...line, quantity } : line));
}

export function cartTotal(lines: readonly CartLine[]): number {
  return lines.reduce((total, line) => total + line.unitAmount * line.quantity, 0);
}

export function cartCount(lines: readonly CartLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}
