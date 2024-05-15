class ReviewModal extends BaseModal {
  constructor(data) {
    super();

    if (data.title) {
      const title = document.createElement('div');
      title.style.fontSize = '200%';
      title.style.fontWeight = 'bold';
      title.innerText = data.title;
      this.element.append(title);
    }

    if (data.link) {
      const link = document.createElement('a');
      link.style.display = 'block';
      link.href = data.link;
      link.innerText = data.link;
      this.element.append(link);
    }

    const row3 = document.createElement('div');
    row3.style.fontStyle = 'italic';
    if (data.score) {
      const score = document.createElement('span');
      score.style.marginRight = '15px';
      score.innerText = `Score: ${data.score}/10`;
      row3.append(score);
    }
    if (data.reviewed_at) {
      const reviewedAt = document.createElement('span');
      reviewedAt.innerText = 'Reviewed at: ' + data.reviewed_at.sort((a, b) => a.localeCompare(b)).join(', ');
      row3.append(reviewedAt);
    }
    this.element.append(row3);

    if (data.description) {
      const separator = document.createElement('hr');
      separator.style.borderColor = 'var(--separator-color-1)';
      this.element.append(separator);

      const description = document.createElement('div');
      description.innerHTML = data.description.replaceAll('\n', '<br>');
      this.element.append(description);
    }

    if (data.tags) {
      const tags = document.createElement('div');
      tags.style.fontStyle = 'italic';
      tags.style.marginTop = '15px';
      tags.style.color = 'var(--text-color-1)';
      tags.innerText = 'Tags: ' + data.tags.join(', ');
      this.element.append(tags);
    }
  }
}