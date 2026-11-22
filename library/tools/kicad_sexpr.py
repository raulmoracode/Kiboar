"""Minimal reader for KiCad's S-expression file format.

The format is a tree of lists where the head names the node:

    (footprint "Name"
        (layer "F.Cu")
        (pad "1" smd rect (at 0 0) (size 1 1)))

Strings keep their quotes so that quoted and bare atoms stay distinguishable,
and callers can tell a layer name from a number without guessing.
"""


class Symbol(str):
    """A quoted atom, e.g. a layer name or a pad number."""


def parse(text):
    """Parse one S-expression and return it as nested lists of str."""
    pos = 0
    length = len(text)

    def skip_space():
        nonlocal pos
        while pos < length and text[pos].isspace():
            pos += 1

    def read_atom():
        nonlocal pos
        if text[pos] == '"':
            start = pos
            pos += 1
            while pos < length:
                if text[pos] == "\\":
                    pos += 2
                    continue
                if text[pos] == '"':
                    pos += 1
                    return Symbol(text[start:pos])
                pos += 1
            raise ValueError("unterminated string")
        start = pos
        while pos < length and not text[pos].isspace() and text[pos] not in "()":
            pos += 1
        return text[start:pos]

    def read_list():
        nonlocal pos
        assert text[pos] == "("
        pos += 1
        node = []
        while True:
            skip_space()
            if pos >= length:
                raise ValueError("unexpected end of input")
            char = text[pos]
            if char == ")":
                pos += 1
                return node
            if char == "(":
                node.append(read_list())
            else:
                node.append(read_atom())

    skip_space()
    if pos >= length or text[pos] != "(":
        raise ValueError("expected '('")
    tree = read_list()
    return tree


def children(node, name):
    """Yield every direct child of `node` whose head is `name`."""
    for child in node[1:]:
        if isinstance(child, list) and child and child[0] == name:
            yield child


def child(node, name):
    """Return the first direct child named `name`, or None."""
    return next(children(node, name), None)


def atom(node, name):
    """Return the first argument of the first child named `name`, or None."""
    found = child(node, name)
    if found is None or len(found) < 2:
        return None
    return found[1]


def is_symbol(value):
    return isinstance(value, Symbol)


def unquote(value):
    """Strip the quotes from a quoted atom, leaving bare atoms alone."""
    if isinstance(value, Symbol):
        return str(value)[1:-1]
    return value