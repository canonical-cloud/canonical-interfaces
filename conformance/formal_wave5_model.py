import hashlib, json

ops = [
    ('quote.create', {'method':'POST','path':'/quotes'}),
    ('quote.get', {'method':'GET','path':'/quotes/{id}'}),
    ('assessment.submit', {'method':'POST','path':'/assessments/{id}/submit'}),
]
ids = [op_id for op_id, _ in ops]
assert len(ids) == len(set(ids))

def digest(spec):
    return hashlib.sha256(json.dumps(spec, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

for _, spec in ops:
    mutated = dict(spec)
    mutated['method'] = 'PATCH' if spec['method'] != 'PATCH' else 'POST'
    assert digest(spec) != digest(mutated)

print('formal_wave5_model: ok')
