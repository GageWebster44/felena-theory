import { BehavioralEngines } from './behavioral/AllEngines';
import { ControlEngines } from './control/AllEngines';
import { ExpansionEngines } from './expansion/AllEngines';
import { GridEngines } from './grid/AllEngines';
import { InfrastructureEngines } from './infrastructure/AllEngines';
import { StrategicEngines } from './strategic/AllEngines';
import { TacticalEngines } from './tactical/AllEngines';

const AllEngines = {
  ...BehavioralEngines,
  ...ControlEngines,
  ...ExpansionEngines,
  ...GridEngines,
  ...InfrastructureEngines,
  ...StrategicEngines,
  ...TacticalEngines,
};

export default AllEngines;