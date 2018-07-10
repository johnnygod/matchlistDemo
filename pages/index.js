import withRedux from "../hoc/withRedux";
import Home from '../home/components/index'

const Comp = () => <Home />

export default withRedux(mapS2P, mapD2P, merge)(Comp)