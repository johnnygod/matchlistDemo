import initStore from '../store'
import withRedux from 'next-redux-wrapper'

export default (mapStateToProps, mapDispatchToProps, mergeProps) => (Comp) => {
    return withRedux({
        createStore: initStore,
        storeKey: '__store',
        mapStateToProps, mapDispatchToProps, mergeProps,
    })(Comp)
}