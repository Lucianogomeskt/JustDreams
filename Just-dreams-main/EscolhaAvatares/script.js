document.addEventListener('DOMContentLoaded', () => {
    const professionCards = document.querySelectorAll('.profession-card');
    const avatarSection = document.getElementById('avatar-selection');
    const avatarCards = document.querySelectorAll('.avatar-card');
    const nextButton = document.getElementById('next-button');

    let selectedProfession = null;
    let selectedAvatar = null;

    const updateNextButtonState = () => {
        if (selectedProfession === 'medico') {
            nextButton.disabled = !selectedAvatar;
        } else {
            nextButton.disabled = !selectedProfession;
        }
    };

    professionCards.forEach(card => {
        card.addEventListener('click', () => {
            professionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            selectedProfession = card.getAttribute('data-profession');
            selectedAvatar = null;

            if (selectedProfession === 'medico') {
                avatarSection.style.display = 'block';
                setTimeout(() => {
                    avatarSection.style.opacity = '1';
                    avatarSection.style.transform = 'translateY(0)';
                }, 10);
            } else {
                avatarSection.style.opacity = '0';
                avatarSection.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    avatarSection.style.display = 'none';
                }, 500);
            }

            avatarCards.forEach(c => c.classList.remove('selected'));
            updateNextButtonState();
        });
    });

    avatarCards.forEach(card => {
        card.addEventListener('click', () => {
            avatarCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            selectedAvatar = card.getAttribute('data-avatar');
            updateNextButtonState();
        });
    });

    nextButton.addEventListener('click', () => {
        if (!nextButton.disabled) {
            console.log('Profissão selecionada:', selectedProfession);
            if (selectedProfession === 'medico') {
                console.log('Avatar selecionado:', selectedAvatar);
            }
            alert(`Você escolheu a profissão: ${selectedProfession} e o avatar: ${selectedAvatar}. Pronto para a próxima etapa!`);
        }
    });
});