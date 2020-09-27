export const curry = (func) => {
    const curried = (...args) => {
        if (args.length >= func.length) {
            return func.apply(this, args);
        } else {
            return (...args2) => {
                return curried.apply(this, args.concat(args2));
            };
        }
    };

    return curried;
};
