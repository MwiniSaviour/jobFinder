import { registerMigration } from "./storage";
import { migrateLegacyState } from "./state";

registerMigration(migrateLegacyState);
