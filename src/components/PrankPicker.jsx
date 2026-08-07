import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ChevronRight, Megaphone, Users, X } from 'lucide-react';
import { getPrankAnimationSpec, getPrankCatalog, getPrankPickerUi } from '../lib/pranks';
import PrankAnimationPlayer from './PrankAnimationPlayer';

function PrankPreviewCard({ prank, localeTag, ui }) {
  const spec = getPrankAnimationSpec(prank.animationType, localeTag);
  const pulseStyle = {
    animation: 'prankPulse 1.1s ease-in-out infinite alternate',
    width: '112px',
    height: '112px',
    borderRadius: '999px',
    background: `${prank.accent}29`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '58px'
  };

  return (
    <div
      style={{
        borderRadius: '28px',
        padding: '20px 18px',
        background: `${prank.accent}14`,
        border: `1px solid ${prank.accent}38`
      }}
    >
      <div
        style={{
          width: '100%',
          minHeight: '240px',
          borderRadius: '28px',
          background: `radial-gradient(circle, ${prank.accent}2e, transparent 68%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={pulseStyle}>{prank.emoji}</div>
          {spec && (
            <div style={{ fontSize: '11px', color: prank.accent, fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase' }}>
              Animacao ao enviar
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '14px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 900 }}>{prank.emoji} {prank.title}</div>
        <div style={{ marginTop: '8px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{prank.previewHeadline}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px', justifyContent: 'center' }}>
        <div className="soft-chip">{prank.command}</div>
        <div className="soft-chip">{ui.privateInRoom}</div>
        <div className="soft-chip" style={{ color: '#79f0a7' }}>{ui.chooseLater}</div>
      </div>

      <div
        style={{
          marginTop: '16px',
          borderRadius: '20px',
          padding: '16px',
          background: 'rgba(255,255,255,0.04)'
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 900, marginBottom: '8px' }}>{ui.howAppears}</div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>{prank.previewExample}</div>
      </div>
    </div>
  );
}

export default function PrankPicker({
  mode = 'room',
  participants = [],
  username,
  friendName,
  onClose,
  onSelect,
  localeTag
}) {
  const ui = useMemo(() => getPrankPickerUi(localeTag), [localeTag]);
  const pranks = useMemo(() => getPrankCatalog(localeTag), [localeTag]);

  const [step, setStep] = useState('list');
  const [selectedPrankId, setSelectedPrankId] = useState(pranks[0]?.id || '');
  const [selectedTargetId, setSelectedTargetId] = useState(mode === 'room' ? 'ALL' : 'PRIVATE');

  const selectedPrank = useMemo(
    () => pranks.find((item) => item.id === selectedPrankId) || pranks[0],
    [pranks, selectedPrankId]
  );

  const availableTargets = useMemo(
    () => (mode === 'room' ? participants.filter((participant) => participant.id !== username) : []),
    [mode, participants, username]
  );

  const submit = (forcedTarget) => {
    const target = forcedTarget || (
      mode === 'room'
        ? selectedTargetId === 'ALL'
          ? { id: 'ALL', name: ui.allInRoom }
          : availableTargets.find((participant) => participant.id === selectedTargetId)
        : { id: 'PRIVATE', name: friendName || '' }
    );

    if (!selectedPrank || !target) return;
    onSelect({
      prank: selectedPrank,
      target
    });
  };

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <style>
        {`
          @keyframes prankPulse {
            from { transform: scale(0.92); }
            to { transform: scale(1.08); }
          }
        `}
      </style>

      <div
        style={{
          width: 'min(720px, 100%)',
          maxHeight: 'min(88vh, 920px)',
          borderRadius: '28px',
          background: 'linear-gradient(180deg, rgba(24,24,31,0.98), rgba(16,16,22,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          {step !== 'list' && (
            <button onClick={() => setStep(step === 'target' ? 'preview' : 'list')} style={{ color: 'white', padding: '6px' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1.2px' }}>
              {step === 'list' ? ui.pickerTitle : step === 'preview' ? ui.previewTitle : selectedPrank ? `${selectedPrank.emoji} ${selectedPrank.title}` : ui.pickerTitle}
            </div>
            <div style={{ fontSize: '17px', fontWeight: 900, marginTop: '4px' }}>
              {step === 'list' ? ui.pickerSubtitle : step === 'preview' ? ui.previewSubtitle : ui.targetTitle}
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '16px 18px 18px' }}>
          {step === 'list' && (
            <div style={{ display: 'grid', gap: '10px' }}>
              {pranks.map((prank) => (
                <button
                  type="button"
                  key={prank.id}
                  onClick={() => {
                    setSelectedPrankId(prank.id);
                    setStep('preview');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: '18px',
                    padding: '14px',
                    background: `${prank.accent}1a`,
                    border: `1px solid ${prank.accent}3d`,
                    color: 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        background: `${prank.accent}29`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        flexShrink: 0
                      }}
                    >
                      {prank.emoji}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 900, fontSize: '15px' }}>{prank.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px', lineHeight: 1.4 }}>{prank.subtitle}</div>
                    </div>
                    <ChevronRight size={18} color={prank.accent} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 'preview' && selectedPrank && (
            <>
              <PrankPreviewCard prank={selectedPrank} localeTag={localeTag} ui={ui} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setStep('list')}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: `1px solid ${selectedPrank.accent}40`,
                    color: 'white',
                    background: 'transparent',
                    fontWeight: 800
                  }}
                >
                  {ui.changePrank}
                </button>
                <button
                  type="button"
                  onClick={() => (mode === 'room' ? setStep('target') : submit({ id: 'PRIVATE', name: friendName || '' }))}
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: selectedPrank.accent,
                    color: 'white',
                    fontWeight: 900
                  }}
                >
                  {mode === 'room' ? ui.chooseUser : ui.sendNow}
                </button>
              </div>
            </>
          )}

          {step === 'target' && selectedPrank && (
            <>
              {availableTargets.length === 0 ? (
                <div style={{ borderRadius: '18px', padding: '16px', background: `${selectedPrank.accent}1a`, color: 'var(--text-secondary)' }}>
                  {ui.noUsers}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => submit({ id: 'ALL', name: ui.allInRoom })}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      borderRadius: '18px',
                      padding: '14px',
                      background: `${selectedPrank.accent}1a`,
                      border: `1px solid ${selectedPrank.accent}3d`,
                      color: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '14px',
                          background: `${selectedPrank.accent}2e`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Users size={20} color={selectedPrank.accent} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 900, fontSize: '15px' }}>{ui.allInRoom}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px', lineHeight: 1.4 }}>{ui.allInRoomDesc}</div>
                      </div>
                      <Megaphone size={18} color={selectedPrank.accent} />
                    </div>
                  </button>

                  {availableTargets.map((participant) => {
                    const active = participant.id === selectedTargetId;
                    return (
                      <button
                        type="button"
                        key={participant.id}
                        onClick={() => setSelectedTargetId(participant.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          borderRadius: '18px',
                          padding: '14px',
                          background: active ? `${selectedPrank.accent}26` : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${active ? `${selectedPrank.accent}52` : 'rgba(255,255,255,0.06)'}`,
                          color: 'white'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '14px',
                              background: `${selectedPrank.accent}29`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              color: selectedPrank.accent,
                              flexShrink: 0
                            }}
                          >
                            {(participant.name || participant.id).charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 900, fontSize: '15px' }}>{participant.name || participant.id}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                              @{participant.id}
                            </div>
                          </div>
                          <ChevronRight size={18} color={selectedPrank.accent} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {availableTargets.length > 0 && (
                <button
                  type="button"
                  onClick={() => submit()}
                  disabled={!selectedTargetId || selectedTargetId === 'ALL'}
                  style={{
                    width: '100%',
                    marginTop: '18px',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: selectedPrank.accent,
                    color: 'white',
                    fontWeight: 900,
                    opacity: !selectedTargetId || selectedTargetId === 'ALL' ? 0.45 : 1
                  }}
                >
                  {ui.sendNow}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
