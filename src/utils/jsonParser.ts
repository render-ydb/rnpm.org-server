export = {
    JSONSetter: function (propertyName) {
        return function JSONSetter(value) {
            if (typeof value !== 'string') {
                value = JSON.stringify(value);
            }
            // @ts-ignore
            this.setDataValue(propertyName, value);
        };
    },
    JSONGetter: function (propertyName) {
        return function JSONGetter() {
            // @ts-ignore
            let value = this.getDataValue(propertyName);
            if (value && typeof value === 'string') {
                value = JSON.parse(value);
            }
            return value;
        };
    }
}