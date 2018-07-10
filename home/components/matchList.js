import css from '../../static/less/home/matchList.less'
import Match from '../containers/match'

export default ({mids}) => (
    <div className={css.matchList}>
        {
            mids.map(mid => {
                return <Match id={mid} />
            })
        }
    </div>
)