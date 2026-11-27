import { Form } from '../../../src';

/**
 * Layout for FeatureStory that adds a submit button inside the Form's own form element: browsers submit a form with several
 * fields on Enter only when it has a submit button, and the Form's form then submits through the handle.
 * @returns The default group followed by a submit button.
 */
export const submitButtonLayout = () => <><Form.Field /><button type="submit">Submit</button></>;
