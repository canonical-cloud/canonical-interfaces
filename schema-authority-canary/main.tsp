// Independently authored TypeSpec authority for the repository-local admission canary.
// Generated JSON Schema is comparison evidence only and never overwrites an authored source.
import "@typespec/json-schema";
using TypeSpec.JsonSchema;

namespace CanonicalContractAdmission;

@id("AuthorityKind")
enum AuthorityKind {
  typespec: "typespec",
  jsonSchema: "json-schema",
}

@id("PeerAuthorityRegistration")
model PeerAuthorityRegistration {
  repository: string;
  authority: AuthorityKind;
  generatedWitnessOnly: boolean;
  owner?: string;
}
