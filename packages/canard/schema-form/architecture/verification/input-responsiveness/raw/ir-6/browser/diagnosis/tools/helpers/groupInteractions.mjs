/** Preserve the native event that supplied each interaction maximum and a qualified key mapping. */
export function groupInteractions(page) {
  const groups = new Map();
  for (const event of page.events) {
    if (
      !event.interactionId ||
      event.startTime < page.start ||
      event.startTime > page.end
    )
      continue;
    const processing = event.processingEnd - event.processingStart;
    const previous = groups.get(event.interactionId);
    if (!previous || processing > previous.processing)
      groups.set(event.interactionId, {
        interactionId: event.interactionId,
        processing,
        event,
      });
  }
  return [...groups.values()].map((group) => {
    const event = group.event;
    let handler, mapping;
    if (event.name === 'keypress') {
      handler = page.handlers.find(
        (entry) =>
          entry.start >= event.processingStart - 0.15 &&
          entry.start <= event.processingEnd + 0.15,
      );
      mapping = 'input inside native keypress processing interval';
    } else if (event.name === 'keyup') {
      handler = [...page.handlers]
        .reverse()
        .find((entry) => entry.start <= event.startTime + 0.15);
      mapping = 'nearest preceding input for native keyup';
    } else if (event.name === 'keydown') {
      handler = page.handlers.find(
        (entry) => entry.start >= event.processingStart - 0.15,
      );
      mapping = 'nearest following input for native keydown';
    }
    const previous = page.validations
      .filter((entry) => entry.at <= event.processingStart)
      .pop();
    return {
      ...group,
      key: handler?.sequence ?? null,
      value: handler?.value ?? null,
      handlerMs: handler?.wallMs ?? null,
      mapping: handler ? mapping : 'unmapped',
      inputDelayMs: event.processingStart - event.startTime,
      precedingDelivery: previous
        ? {
            sequence: previous.sequence,
            deltaMs: event.processingStart - previous.at,
          }
        : null,
      validationRunTiming:
        'not recorded in formal pages; diagnostic traces required',
    };
  });
}
