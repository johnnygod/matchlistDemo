import {actionTypes as types} from './actions'
import {sourceReducerKeys as sRKeys, MappingByTopSourceReducerKeys as mbtsRKeys, sourceMappingReducerKeys as smRKeys, genBasicDataReducer} from '../reducers/common'

const reducerKeys = {
	s: [sRKeys.ms, sRKeys.mks, sRKeys.sels],
	mbts: [mbtsRKeys.mksBm, mbtsRKeys.selsBmk],
	sm: smRKeys.msm
}

export default genBasicDataReducer(types, reducerKeys)