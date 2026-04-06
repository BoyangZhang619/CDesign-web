import { ref } from 'vue'
import {
    getTimeOfDay,
    formatCSTDate,
    getTimeInCST
} from '../utils/homePageUtils'

export function useHomePageLogic() {
    const timeOfDay = ref(getTimeOfDay())
    const currentDate = ref(formatCSTDate(getTimeInCST()))
    function refreshTimeData() {
        currentDate.value = formatCSTDate(getTimeInCST())
        timeOfDay.value = getTimeOfDay()
    }

    return {
        refreshTimeData
    }
}
