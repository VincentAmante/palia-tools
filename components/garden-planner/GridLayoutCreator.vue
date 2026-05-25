<script setup lang="ts">

const widthInTiles = ref(9)
const heightInTiles = ref(9)
</script>

<template>
    <!-- Body -->
    <div class="bg-palia-blue-dark mt-2 p-2">
        <h3>
            Dimensions
        </h3>

        <table>
            <tbody>
                <tr v-for="row in heightInTiles" :key="`row-${row}`">
                    <td v-for="cell in widthInTiles" :key="`cell-${cell},${row}`">
                        <button class="btn btn-square bg-palia-blue aspect-square"/>
                    </td>
                </tr>
            </tbody>
        </table>

        <div>
            <p>Row</p>
            <input v-model="widthInTiles" class="input" type="number"> 
            <p>Column</p>
            <input v-model="heightInTiles" class="input" type="number"> 
        </div>
    </div>
</template>