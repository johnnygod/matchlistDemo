import {combineSubReducers} from '../reducers/utils'

const addFN = (state, data) => {
	return data == null ? state : Object.assign({}, state, data)
}

const delFN = (state, data) => {
	if(state == null)
		return null

	let newState = Object.assign({}, state)
	let change = false

	if(Array.isArray(data))
		data.forEach(key => {
			if(key != null && newState.hasOwnProperty(key)){
				delete newState[key]
				change = true
			}
		})
	else if(newState.hasOwnProperty(data)){
		delete newState[data]
		change = true
	}

	return change ? newState : state
}

const partialDelFN = (state, key, source) => {
	const multipleKeys = Array.isArray(key)

	if(state == null || multipleKeys ? key.every(k => !state.hasOwnProperty(k)) : !state.hasOwnProperty(key))
		return state

	let newState = Object.assign({}, state)
	const isArr = Array.isArray(source)
	
	const filterCompareFN = (target) => isArr ? source.every(item => item.split('_')[1] != target) : source.split('_')[1] != target
	const filterMapping = (val) => {
		//handle array of array case (ex: correct score)
		if(val.some(item => Array.isArray(item))){
			let newVal = []
			val.forEach(item => {
				if(Array.isArray(item))
					newVal.push(item.filter(filterCompareFN))				
				else
					newVal.push(filterCompareFN(item) ? item : null)
			})
			return newVal
		}
		else
			return val.filter(filterCompareFN)
	}

	if(multipleKeys){
		key.forEach(k => {
			newState[k] = filterMapping(newState[key])
		})
	}		
	else
		newState[key] = filterMapping(newState[key])	

	return newState
}

const updateFN = (state, data) => {
	if(data == null)
		return state

	//in order to avoid add match
	//need to do update this way instead of Object.assign({}, data, state)
	const newState = Object.assign({}, state)

	let needUpdate = false
	Object.keys(data).forEach(key => {
		if(newState.hasOwnProperty(key)){
			needUpdate = true

			newState[key] = Object.assign({}, data[key])
		}
	})

	return needUpdate ? newState : state
}

const sortByOrderThenById = (a, b) => {
	const {order: order_a, id: id_a} = a
	const {order: order_b, id: id_b} = b

	if(+order_a != +order_b)
		return +order_a - +order_b
	else
		return id_a < id_b ? -1 : 1
}

export const sourceReducerKeys = {ss: 'ss', cs: 'cs', ls: 'ls', ms: 'ms', ts: 'ts', mks: 'mks', sels: 'sels'}

//sortAfterUpdate: need to sort source again after
export const MappingByTopSourceReducerKeys = {
	msBl: {m: 'msBl', s: 'ms', ts: 'ls', sortAfterUpdate: true},
	mksBm: {m: 'mksBm', s: 'mks', ts: 'ms', sortAfterUpdate: true},
	selsBmk: {m: 'selsBmk', s: 'sels', ts: 'mks', sortAfterUpdate: false},
	msBs:{m: 'msBs', s: 'ms', ts: 'ss', sortAfterUpdate: true},
	tsBs: {m: 'tsBs', s: 'ts', ts: 'ss', sortAfterUpdate: true},
}

export const sourceMappingReducerKeys = {
	ssm: {m: 'ssm', s: 'ss'},
	csm: {m: 'csm', s: 'cs'},
	lsm: {m: 'lsm', s: 'ls'},
	msm: {m: 'msm', s: 'ms'},
	mksm: {m: 'mksm', s: 'mks'},
}

export const genSourceReducer = (t, key) => {
	return (state = null, action) => {
		switch(action.type){
			case t.ADD:
			{
				const {data: {[key]: data}} = action
				return addFN(state, data)
			}			
			case t.UPDATE:
			{
				const {data: {[key]: data}} = action
				return updateFN(state, data)
			}
			case t.DEL:
			{
				const {data: {[key]: data}} = action
				return data == null ? state : delFN(state, data)
			}
			default:
				return state
		}
	}
}

export const batchCreateSourceReducer = (t, keys) => {
	return keys.reduce((acc, key) => {
		acc[key] = genSourceReducer(t, key)
		return acc
	}, {})
}

export const genMappingByTopSourceReducer = (t, keyPair) => {
	const {m: mappingKey, s: sourceKey, ts: topSourceKey} = keyPair
	return (state = null, action) => {
		switch(action.type){
			case t.ADD:{
				const {data: {[mappingKey]: mapping, [sourceKey]: source, [topSourceKey]: topSource}} = action

				if(mapping != null)
					return addFN(state, mapping)				
				else if(topSource != null && source != null){
					const newMapping = {
						[Object.keys(topSource)[0]]: Object.keys(source).sort((a, b) => {
							return sortByOrderThenById(source[a], source[b])
						}).map(item => {
							return source[item].id
						})
					}
					return addFN(state, newMapping)
				}
				else
					return state
			}		
			case t.DEL:
			{
				const {data: {[topSourceKey]: ts, [mappingKey + 'Key']: keyM, [sourceKey]: s}} = action
				if(ts != null)
					return delFN(state, ts)
				else if(keyM != null)
					return partialDelFN(state, keyM, s)
				else
					return state
			}
			default:
				return state
		}
	}
}

export const batchCreateMappingByTopSourceReducer = (t, keys) => {
	return keys.reduce((acc, cur) => {
		acc[cur.m] = genMappingByTopSourceReducer(t, cur)
		return acc
	}, {})
}

export const genSourceMappingReducer = (t, keyPair) => {
	const {m, s} = keyPair
	return (state = null, action) => {
		switch(action.type){
			case t.ADD:{
				const {data: {[m]: mapping}} = action

				return mapping == null ? state : Array.from(mapping)
			}
			case t.DEL:
			{
				const {data: {[s]: delData}} = action
				if(state == null || delData == null)
					return state

				const isArr = Array.isArray(delData)				
				const compare = isArr ? delData.map(item => item.split('_')[1]) : delData.split('_')[1]
				
				if(isArr){
					let needChange = false
					let newState = []
					state.forEach(id => {
						if(compare.find(item => item == id) != null)
							needChange = true
						else
							newState.push(id)
					})
					return needChange ? newState : state
				}
				else{
					return state.find(id => id == compare) != null ? state.filter(id => id != compare) : state
				}
			}
			default:
				return state
		}
	}
}

export const batchCreateSourceMappingReducer = (t, keys) => {
	return keys.reduce((acc, cur) => {
		acc[cur.m] = genSourceMappingReducer(t, cur)
		return acc
	}, {})
}

export const genLangs = (t) => {
	return (state = null, action) => {
		switch(action.type){
			case t.ADD:
			{
				const {data: {langs: data}} = action
				return addFN(state, data)
			}			
			case t.UPDATE:
			{
				const {data: {langs: data}} = action
				return updateFN(state, data)
			}
			// case t.DEL:
			// {
			// 	const {data} = action
			// 	let ss, ls, ms, mks, sels, ts
			// 	if(data == null)
			// 		return state
			// 	else{
			// 		({ss, ls, ms, mks, sels, ts} = data)
			// 		return delFN(state, [ss, ls, ms, mks, sels, ts])
			// 	}
			// }
			default:
				return state
		}
	}
}

const genMappingByNewSource = (newSourceArr) => {
	return newSourceArr.sort(sortByOrderThenById)
						.map(item => {
							return item.id
						})
}

const updateSourceMappingAfterAddSource = (sourceMappings, newState, action) => {
	if(Array.isArray(sourceMappings)){
		sourceMappings.forEach(keyPair => {
			updateSourceMappingAfterAddSource(keyPair, newState, action)
		})
	}
	else{
		const {m, s} = sourceMappings
		const {data: {[m]: mapping, [s]: source }} = action

		//gen new mapping based on order of new source
		if(mapping == null && source != null){
			const newSource = newState[s], newSourceArr = Object.keys(newSource).map(item => newSource[item])
			newState[m] = genMappingByNewSource(newSourceArr)
		}
	}
}

const updateMappingByTopSourceAfterAddSource = (mappingByTopSources, newState, action) => {
	if(Array.isArray(mappingByTopSources)){
		mappingByTopSources.forEach(keyPair => {
			updateMappingByTopSourceAfterAddSource(keyPair, newState, action)
		})
	}
	else{
		const {m, s} = mappingByTopSources
		const {data: {[s]: source, [m + 'Key']: mappingKey}} = action

		if(mappingKey == null)
			return

		const sourcePrefix = Object.keys(source)[0].split('_')[0]

		if(source != null){
			let sourceArr_newState
			if(newState[m] == null || newState[m][mappingKey] == null)
				sourceArr_newState = []
			else
				sourceArr_newState = newState[m][mappingKey].map(key => {
					return newState[s][`${sourcePrefix}_${key}`]
				})

			const newSourceArr = sourceArr_newState.concat(Object.keys(source).map(key => {
				return source[key]
			}))
			
			newState[m] = Object.assign({}, newState[m], {
				[mappingKey]: genMappingByNewSource(newSourceArr)
			})
		}
	}
}

const updateSourceMappingAfterUpdateSource = (sourceMappings, newState, action) => {
	if(Array.isArray(sourceMappings)){
		sourceMappings.forEach(keyPair => {
			updateSourceMappingAfterUpdateSource(keyPair, newState, action)
		})
	}
	else{
		const {m, s} = sourceMappings

		const {data: {[s]: source }} = action 

		if(source != null){
			//gen new mapping based on order of new source
			const newSource = newState[s], newSourceArr = newSource ? Object.keys(newSource).map(item => newSource[item]) : []
			newState[m] = genMappingByNewSource(newSourceArr)	
		}
	}
}

const updateMappingByTopSourceAfterUpdateSource = (mappingByTopSources, newState, action) => {
	if(Array.isArray(mappingByTopSources)){
		mappingByTopSources.forEach(keyPair => {
			updateMappingByTopSourceAfterUpdateSource(keyPair, newState, action)
		})
	}
	else{
		const {m, s, ts, sortAfterUpdate} = mappingByTopSources
		if(!sortAfterUpdate)
			return

		const {data: {[ts]: topSource, [s]: source, [m + 'Key']: _mappingKey}} = action

		if(source == null)
			return

		let mappingKey
		if(topSource != null)
			mappingKey = Object.keys(topSource)[0]		
		else if(_mappingKey != null)
			mappingKey = _mappingKey
		else
			return

		const sourcePrefix = Object.keys(source)[0].split('_')[0]

        if (newState[m] == null || newState[m][mappingKey] == null)
            return

        const newSourceArr = newState[m][mappingKey].map(key => {
            return newState[s][`${sourcePrefix}_${key}`]
        })

        newState[m] = Object.assign({}, newState[m], {
            [mappingKey]: genMappingByNewSource(newSourceArr)
        })

	}
}


/* #subReducerOpts
{
	s: [Keys for sourceReducer],
	mbts: [Keys for MappingByTopSourceReducer],
	sm: [Keys for sourceMappingReducer],
	other: {custom subReducers},
}
*/
export const genBasicDataReducer = (t, subReducerOpts, getDataFromFetchDataActFN) => {
	const langs = genLangs(t)

	let subReducers = null
	if(subReducerOpts !== undefined){
		subReducers = {}

		if(subReducerOpts.hasOwnProperty('s'))
			subReducers = Object.assign(subReducers, Array.isArray(subReducerOpts.s) ? batchCreateSourceReducer(t, subReducerOpts.s) : {[subReducerOpts.s]: genSourceReducer(t, subReducerOpts.s)})

		if(subReducerOpts.hasOwnProperty('mbts'))
			subReducers = Object.assign(subReducers, Array.isArray(subReducerOpts.mbts) ? batchCreateMappingByTopSourceReducer(t, subReducerOpts.mbts) : {[subReducerOpts.mbts.m]: genMappingByTopSourceReducer(t, subReducerOpts.mbts)})

		if(subReducerOpts.hasOwnProperty('sm'))
			subReducers = Object.assign(subReducers, Array.isArray(subReducerOpts.sm) ? batchCreateSourceMappingReducer(t, subReducerOpts.sm) : {[subReducerOpts.sm.m]: genSourceMappingReducer(t, subReducerOpts.sm)})

		if(subReducerOpts.hasOwnProperty('others'))
			subReducers = Object.assign(subReducers, subReducerOpts.others)

		if(Object.keys(subReducers).length == 0)
			subReducers = null
	}

	const dataReducer = (state = null, action) => {
		switch(action.type){
			case t.FETCHDATA:{
				const newData = getDataFromFetchDataActFN === undefined ? action.data : getDataFromFetchDataActFN(action)
				return newData == null ? null : Object.assign({}, newData)
			}				
			case t.FULLUPDATE:
				return action.data == null ? null : Object.assign({}, action.data)
			case t.RESET:
				return null
			case t.ADD:{
				if(subReducers == null)
					return state

				let newState = combineSubReducers(Object.assign({}, subReducers, {langs}), state, action)

				if(subReducerOpts.hasOwnProperty('sm'))
					updateSourceMappingAfterAddSource(subReducerOpts.sm, newState, action)

				if(subReducerOpts.hasOwnProperty('mbts'))
					updateMappingByTopSourceAfterAddSource(subReducerOpts.mbts, newState, action)

				return newState
			}
			case t.UPDATE:{
				if(subReducers == null)
					return state

				let newState = combineSubReducers(Object.assign({}, subReducers, {langs}), state, action)

				if(subReducerOpts.hasOwnProperty('sm'))
					updateSourceMappingAfterUpdateSource(subReducerOpts.sm, newState, action)

				if(subReducerOpts.hasOwnProperty('mbts'))
					updateMappingByTopSourceAfterUpdateSource(subReducerOpts.mbts, newState, action)

				return newState
			}
			case t.DEL:
				return subReducers == null ? state : combineSubReducers(Object.assign({}, subReducers, {langs}), state, action)
			case t.MULTIACTION:{
				return action.data.reduce((newState, item) => {
					const subAction = Object.assign({}, item, {
						type: t[item.type.toUpperCase()]
					})
					return dataReducer(newState, subAction)
				}, state)
			}
			default:
				return state
		}
	}

	return dataReducer
}