<template>
  <v-dialog
    ref="dialog"
    v-model="modal"
    width="290px"
  >
    <template v-slot:activator="{ on }">
      <v-text-field
        :value="formattedValue"
        :label="label"
        :placeholder="placeholder"
        readonly
        outlined
        solo
        flat
        dense
        hide-details
        color="#E9E9E9"
        background-color="white"
        v-on="on"
      />
    </template>
    <v-date-picker
      :value="value"
      @input="save"
      :disabled="disabled"
      ref="picker"
      :max="maxDate"
      :min="minDate"
      no-title
    >
    </v-date-picker>
  </v-dialog>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    label: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      modal: false,
      maxDate: moment().subtract(13, 'years').format('YYYY-MM-DD'),
      minDate: moment().subtract(100, 'years').format('YYYY-MM-DD')
    }
  },
  computed: {
    formattedValue () {
      if (!this.value) {
        return
      }
      return moment(this.value).utc().format('MMM Do, YYYY')
    }
  },
  watch: {
    modal (val) {
      val && setTimeout(() => (this.$refs.picker.activePicker = 'YEAR'))
    }
  },
  methods: {
    save (value) {
      this.$emit('input', value)
      this.modal = false
    }
  }
}
</script>
