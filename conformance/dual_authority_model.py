#!/usr/bin/env python3
from dataclasses import dataclass
from collections import deque

@dataclass(frozen=True)
class State:
    authored_schema: bool = False
    typespec: bool = False
    generated_matches_authored: bool = False
    wire_semantics_match: bool = False
    admitted: bool = False


def next_states(s: State):
    out = []
    if not s.authored_schema:
        out.append(State(True, s.typespec, s.generated_matches_authored, s.wire_semantics_match, False))
    if not s.typespec:
        out.append(State(s.authored_schema, True, s.generated_matches_authored, s.wire_semantics_match, False))
    if s.authored_schema and s.typespec and not s.generated_matches_authored:
        out.append(State(True, True, True, s.wire_semantics_match, False))
    if s.authored_schema and s.typespec and not s.wire_semantics_match:
        out.append(State(True, True, s.generated_matches_authored, True, False))
    if s.authored_schema and s.typespec and s.generated_matches_authored and s.wire_semantics_match and not s.admitted:
        out.append(State(True, True, True, True, True))
    return out


def check(s: State):
    if s.admitted:
        assert s.authored_schema, "admission without authored JSON Schema authority"
        assert s.typespec, "admission without TypeSpec authority"
        assert s.generated_matches_authored, "admission despite authored/generated schema disagreement"
        assert s.wire_semantics_match, "admission despite wire-semantics disagreement"


def main():
    start = State()
    q = deque([start])
    seen = {start}
    edges = 0
    while q:
        s = q.popleft()
        check(s)
        for n in next_states(s):
            edges += 1
            check(n)
            if n not in seen:
                seen.add(n)
                q.append(n)
    assert any(s.admitted for s in seen), "model never reaches a valid admitted contract"
    print(f"dual-authority model: {len(seen)} states, {edges} transitions")

if __name__ == "__main__":
    main()
